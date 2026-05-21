import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminApiService } from '../core/admin-api.service';
import { ToastService } from '../core/toast.service';
import { AdminCategory } from '../core/admin.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.html',
})
export class AdminCategoriesComponent implements OnInit {
  private api = inject(AdminApiService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  categories = signal<AdminCategory[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingCategory = signal<AdminCategory | null>(null);

  totalSubcategory = () =>
    this.categories().reduce((sum, c) => sum + (c.subcategory?.length ?? 0), 0);
  totalComposants = () => this.categories().reduce((sum, c) => sum + (c.composantCount ?? 0), 0);

  categoryForm = this.fb.group({
    name: ['', Validators.required],
    slug: [''],
    description: [''],
    image: [''],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.api.getCategories().subscribe({
      next: (data) => {
        console.log('data', data);
        this.categories.set(data.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toSlug = (text: string): string =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  linkToSlug(event: Event): void {
    this.categoryForm.patchValue({
      slug: this.toSlug((event.target as HTMLInputElement).value),
    });
  }

  openModal(cat?: AdminCategory): void {
    this.editingCategory.set(cat ?? null);
    this.categoryForm.reset({
      name: cat?.name ?? '',
      slug: cat?.slug ?? '',
      description: cat?.description ?? '',
      image: cat?.image ?? '',
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingCategory.set(null);
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) return;
    this.saving.set(true);

    const v = this.categoryForm.value;
    const payload: Partial<AdminCategory> = {
      name: v.name ?? undefined,
      slug: v.slug ?? this.toSlug(v.name ?? '') ?? undefined,
      description: v.description ?? undefined,
      image: v.image ?? undefined,
    };
    const editing = this.editingCategory();
    const obs = editing
      ? this.api.updateCategory(editing.id, payload)
      : this.api.createCategory(payload);

    obs.subscribe({
      next: () => {
        this.toast.success(editing ? 'Catégorie mise à jour !' : 'Catégorie créée !');
        this.saving.set(false);
        this.closeModal();
        this.loadCategories();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? "Erreur lors de l'enregistrement");
        this.saving.set(false);
      },
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('Supprimer cette catégorie ?')) return;
    this.api.deleteCategory(id).subscribe({
      next: () => {
        this.toast.success('Catégorie supprimée');
        this.loadCategories();
      },
      error: () => this.toast.error('Erreur lors de la suppression'),
    });
  }
}
