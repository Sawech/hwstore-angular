import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminApiService } from '../../core/admin-api.service';
import { ToastService } from '../../core/toast.service';
import { AdminCategory, AdminComponent, AdminSubCategory } from '../../core/admin.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-nouveau-composant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nouveau-composant.html',
})
export class AdminNouveauComposantComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(AdminApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  allCategories = signal<AdminCategory[]>([]);
  currentComponent = signal<AdminComponent | null>(null);
  currentSubcategories = signal<AdminSubCategory[]>([]);
  availableTags = signal<Record<string, string[]>>({});
  selectedTags = signal<Record<string, string[]>>({});
  mainImageFile = signal<File | null>(null);
  galleryFiles = signal<(File | null)[]>([null, null, null]);
  mainImagePreview = signal<string | null>(null);
  galleryPreviews = signal<(string | null)[]>([null, null, null]);
  saving = signal(false);
  gallerySlots = [0, 1, 2];

  form = this.fb.group({
    name: ['', Validators.required],
    brand: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0],
    category: [''],
    subcategory_id: ['', Validators.required],
    specs: this.fb.array([]),
  });

  get specsArray() {
    return this.form.get('specs') as FormArray;
  }

  ngOnInit(): void {
    this.api.getCategories().subscribe({
      next: (cats) => {
        this.allCategories.set(cats.data);

        const id = this.route.snapshot.paramMap.get('id');
        if (!id) return;

        this.api.getComponentById(id).subscribe({
          next: (res) => {
            this.currentComponent.set(res);

            const parentCategory = cats.data.find((c) =>
              c.subcategory.find((sc) => sc.id === res.subcategory.id),
            );

            if (parentCategory) {
              this.currentSubcategories.set(parentCategory.subcategory);
            }

            const specsEntries = Object.entries(res.specs ?? {});
            specsEntries.forEach(([key, value]) => {
              this.specsArray.push(this.fb.group({ key: [key], value: [String(value)] }));
            });

            this.availableTags.set((res.subcategory.tags as Record<string, string[]>) ?? {});
            this.selectedTags.set(res.tags as Record<string, string[]>);

            if (res.images?.[0]) this.mainImagePreview.set(res.images[0]);
            const galleryPreviews = [null, null, null] as (string | null)[];
            res.images?.slice(1).forEach((url, i) => {
              galleryPreviews[i] = url;
            });
            this.galleryPreviews.set(galleryPreviews);

            this.form.patchValue({
              name: res.name,
              brand: res.brand,
              description: res.description,
              price: res.price,
              stock: res.stock,
              category: parentCategory?.slug ?? '',
              subcategory_id: String(res.subcategory?.id ?? ''),
            });
          },
        });
      },
      error: () => {},
    });
  }

  onCategoryChange(): void {
    const slug = this.form.get('category')?.value;
    const cat = this.allCategories().find((c) => c.slug === slug);
    this.currentSubcategories.set(cat?.subcategory ? cat.subcategory : []);
    this.form.get('subcategory_id')?.setValue(null);
  }

  onSubCategoryChange(): void {
    const subcategory_id = this.form.get('subcategory_id')?.value;
    const subCategory = this.currentSubcategories().find((c) => c.id === Number(subcategory_id));
    console.log('Selected subcategory', subCategory);
    this.availableTags.set((subCategory?.tags as Record<string, string[]>) ?? {});
    this.selectedTags.set({});
  }

  toggleTagValue(group: string, value: string): void {
    this.selectedTags.update((current) => {
      const groupValues = current[group] ? [...current[group]] : [];
      const idx = groupValues.indexOf(value);
      if (idx === -1) groupValues.push(value);
      else groupValues.splice(idx, 1);
      return { ...current, [group]: groupValues };
    });
  }

  isTagSelected(group: string, value: string): boolean {
    return this.selectedTags()[group]?.includes(value) ?? false;
  }

  tagGroups(): string[] {
    return Object.keys(this.availableTags());
  }

  addSpec(): void {
    this.specsArray.push(this.fb.group({ key: [''], value: [''] }));
  }

  removeSpec(i: number): void {
    this.specsArray.removeAt(i);
  }

  onFileChange(e: Event, type: 'main' | 'gallery', idx?: number): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (type === 'main') {
      this.mainImageFile.set(file);
    } else if (idx !== undefined) {
      const files = [...this.galleryFiles()];
      files[idx] = file;
      this.galleryFiles.set(files);
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (type === 'main') this.mainImagePreview.set(result);
      else if (idx !== undefined) {
        const previews = [...this.galleryPreviews()];
        previews[idx] = result;
        this.galleryPreviews.set(previews);
      }
    };
    reader.readAsDataURL(file);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => this.mainImagePreview.set(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    const specs: Record<string, string> = {};
    this.specsArray.controls.forEach((c) => {
      const k = c.get('key')?.value?.trim();
      const v = c.get('value')?.value?.trim();
      if (k && v) specs[k] = v;
    });

    const v = this.form.value;
    const slug = (v.name ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const imagesToUpload: File[] = [];
    if (this.mainImageFile()) imagesToUpload.push(this.mainImageFile()!);
    this.galleryFiles().forEach((f) => {
      if (f) imagesToUpload.push(f);
    });

    const upload$ = imagesToUpload.map((file) => {
      const formData = new FormData();
      formData.append('file', file);
      return this.api.uploadImage(formData);
    });

    const payload = {
      name: v.name!,
      brand: v.brand!,
      description: v.description ?? '',
      price: Number(v.price),
      stock: Number(v.stock),
      subcategory: Number(v.subcategory_id),
      slug,
      tags: this.selectedTags(),
      specs,
    };

    const save$ = (images: string[]) => {
      const data = { ...payload, images };
      const obs = this.currentComponent()
        ? this.api.updateComponent(this.route.snapshot.paramMap.get('id')!, data)
        : this.api.createComponent(data);

      obs.subscribe({
        next: () => {
          this.toast.success(
            this.currentComponent() ? 'Composant mis à jour !' : 'Composant créé !',
          );
          this.router.navigate(['/admin/composants']);
        },
        error: (err) => {
          this.toast.error(err.error?.message ?? "Erreur lors de l'enregistrement");
          this.saving.set(false);
        },
      });
    };

    if (upload$.length === 0) {
      save$([]);
    } else {
      forkJoin(upload$).subscribe({
        next: (results) => save$(results.map((r) => r.url)),
        error: () => {
          this.toast.error("Erreur lors de l'upload des images");
          this.saving.set(false);
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/composants']);
  }
}
