import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../core/toast.service';
import { AppConfig } from '../../core/config/app-config';
import { environment } from '../../../environments/environment.prod';
import { AdminApiService } from '../core/admin-api.service';
import { AdminSubCategory } from '../core/admin.model';

interface CategoryOption {
  id: number;
  name: string;
}

interface TagGroup {
  uid: number;
  name: string;
  values: string[];
}

interface SousCategoryPayload {
  name: string;
  slug: string;
  description: string;
  image: string;
  category: number;
  tags: Record<string, string[]>;
}

@Component({
  selector: 'app-admin-sous-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sous-categories.html',
})
export class AdminSousCategoriesComponent implements OnInit {
  private api = inject(AdminApiService);
  private toast = inject(ToastService);
  private base = `${environment.apiUrl}/admin`;

  sousCategories = signal<AdminSubCategory[]>([]);
  loading = signal(true);

  showModal = signal(false);
  saving = signal(false);
  editingItem = signal<AdminSubCategory | null>(null);
  isEditMode = computed(() => this.editingItem() !== null);

  fieldName = signal('');
  fieldSlug = signal('');
  fieldDescription = signal('');
  fieldImage = signal('');
  fieldCategoryId = signal<number | null>(null);

  tagGroups = signal<TagGroup[]>([]);
  private tagUidCounter = 0;

  categoryOptions = signal<CategoryOption[]>([]);

  skeletonRows = Array(5).fill(0);

  ngOnInit(): void {
    this.loadSousCategories();
  }

  loadSousCategories(): void {
    this.loading.set(true);
    this.api.getSubCategories().subscribe({
      next: (res) => {
        console.log('Loaded category options:', res);
        this.sousCategories.set(res ?? []);
        this.loading.set(false);
        this.loadCategoryOptions();
      },
      error: () => {
        this.toast.error('Impossible de charger les sous-catégories');
        this.loading.set(false);
        this.loadCategoryOptions();
      },
    });
  }

  loadCategoryOptions(): void {
    this.api.getCategories().subscribe({
      next: (res) => {
        const opts: CategoryOption[] = (res.data ?? []).map((c) => ({
          id: c.id,
          name: c.name,
        }));
        this.categoryOptions.set(opts);
      },
    });
  }

  toSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  openModal(item?: AdminSubCategory): void {
    this.editingItem.set(item ?? null);
    this.fieldName.set(item?.name ?? '');
    this.fieldSlug.set(item?.slug ?? '');
    this.fieldDescription.set(item?.description ?? '');
    this.fieldImage.set(item?.image ?? '');
    this.fieldCategoryId.set(item?.category?.id ?? null);

    const groups: TagGroup[] = [];
    if (item?.tags) {
      for (const [key, vals] of Object.entries(item.tags)) {
        groups.push({ uid: ++this.tagUidCounter, name: key, values: [...vals] });
      }
    }
    this.tagGroups.set(groups);

    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingItem.set(null);
  }

  onNameInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.fieldName.set(val);
    this.fieldSlug.set(this.toSlug(val));
  }

  onSlugInput(event: Event): void {
    this.fieldSlug.set((event.target as HTMLInputElement).value);
  }

  onDescriptionInput(event: Event): void {
    this.fieldDescription.set((event.target as HTMLTextAreaElement).value);
  }

  onImageInput(event: Event): void {
    this.fieldImage.set((event.target as HTMLInputElement).value);
  }

  onCategoryChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.fieldCategoryId.set(val ? +val : null);
  }

  addTagGroup(nameInput: HTMLInputElement): void {
    const name = nameInput.value.trim();
    if (!name) return;
    const exists = this.tagGroups().some((g) => g.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      this.toast.error(`Le tag "${name}" existe déjà`);
      return;
    }
    this.tagGroups.update((gs) => [...gs, { uid: ++this.tagUidCounter, name, values: [] }]);
    nameInput.value = '';
  }

  removeTagGroup(uid: number): void {
    this.tagGroups.update((gs) => gs.filter((g) => g.uid !== uid));
  }

  addTagValue(uid: number, valueInput: HTMLInputElement): void {
    const val = valueInput.value.trim();
    if (!val) return;
    this.tagGroups.update((gs) =>
      gs.map((g) =>
        g.uid === uid && !g.values.includes(val) ? { ...g, values: [...g.values, val] } : g,
      ),
    );
    valueInput.value = '';
  }

  removeTagValue(uid: number, value: string): void {
    this.tagGroups.update((gs) =>
      gs.map((g) => (g.uid === uid ? { ...g, values: g.values.filter((v) => v !== value) } : g)),
    );
  }

  private buildTagsRecord(): Record<string, string[]> {
    const record: Record<string, string[]> = {};
    this.tagGroups().forEach((g) => {
      record[g.name] = g.values;
    });
    return record;
  }

  isFormValid(): boolean {
    return (
      this.fieldName().trim().length > 0 &&
      this.fieldSlug().trim().length > 0 &&
      this.fieldCategoryId() !== null
    );
  }

  saveItem(): void {
    if (!this.isFormValid()) return;
    this.saving.set(true);

    const payload: SousCategoryPayload = {
      name: this.fieldName().trim(),
      slug: this.fieldSlug().trim(),
      description: this.fieldDescription().trim(),
      image: this.fieldImage().trim(),
      category: this.fieldCategoryId()!,
      tags: this.buildTagsRecord(),
    };

    console.log('Submitting payload:', payload);

    const editing = this.editingItem();
    const obs = editing
      ? this.api.updateSubCategory(editing.id, payload)
      : this.api.addSubcategory(payload);

    obs.subscribe({
      next: () => {
        this.toast.success(editing ? 'Sous-catégorie mise à jour !' : 'Sous-catégorie créée !');
        this.saving.set(false);
        this.closeModal();
        this.loadSousCategories();
      },
      error: (err) => {
        this.toast.error(err?.error?.message ?? "Erreur lors de l'enregistrement");
        this.saving.set(false);
      },
    });
  }

  deleteItem(id: number): void {
    if (!confirm('Supprimer cette sous-catégorie ?')) return;
    this.api.deleteSubCategory(id).subscribe({
      next: () => {
        this.toast.success('Sous-catégorie supprimée');
        this.loadSousCategories();
      },
      error: () => this.toast.error('Erreur lors de la suppression'),
    });
  }

  categoryName(item: AdminSubCategory): string {
    return item.category?.name ?? '—';
  }
}
