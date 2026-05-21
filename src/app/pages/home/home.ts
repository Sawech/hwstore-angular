/**
 * HWstore — Home Page Component
 */

import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { Category, Composant } from '../../core/models/client.model';
import { ComposantCardComponent } from '../../shared/composant-card/composant-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ComposantCardComponent],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  private clientService = inject(ClientService);
  colabs = [
    {
      name: 'AMD',
      image: 'images/Amd_logo.png',
    },
    {
      name: 'DELL',
      image: 'images/Dell_logo.png',
    },
    {
      name: 'DJEZZY',
      image: 'images/Djezzy_Logo.png',
    },
    {
      name: 'INTEL',
      image: 'images/Intel_logo.png',
    },
    {
      name: 'NVIDIA',
      image: 'images/Nvidia_logo.png',
    },
  ];
  responsiveOptions: any[] | undefined;

  bestSellers = signal<Composant[]>([]);
  isLoading = signal(true);

  categories = signal<Category[]>([]);

  readonly features = [
    {
      icon: 'verified_user',
      title: 'Garantie étendue',
      description:
        "Tous nos composants bénéficient d'une couverture complète pour une tranquillité d'esprit totale.",
    },
    {
      icon: 'local_shipping',
      title: 'Livraison rapide',
      description:
        'Expédition sécurisée partout en Algérie avec suivi en temps réel de votre commande.',
    },
    {
      icon: 'support_agent',
      title: 'Support expert',
      description:
        'Une équipe technique certifiée à votre disposition pour vous conseiller et vous assister.',
    },
    {
      icon: 'shield',
      title: 'Authenticité',
      description: 'Garantie de composants 100% originaux aux prix les plus compétitifs du marché.',
    },
  ];

  readonly testimonials = [
    {
      quote:
        "\"Service client exceptionnel. J'ai commandé une configuration gaming complète et j'ai été bluffé par la rapidité et le soin apporté à l'emballage.\"",
      name: 'Sofiane K.',
      role: 'Développeur Fullstack',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA4htVjdsi6oMWEC_f9T3LZX0Vkr0KozVSYm9NXV7eZ3GSl2J-qHiZ39tSDE-UbtjKDtX7SjHotN38yzoeLuWTmwHktx0yQJxm3OpWQZTIg0fNFEOLypMsoPbp5P7xQPOzQ2vl2xkIjvrtEF3uCZYaApWECpSXxVZ4gmy4mUlscmO8567K28U9SYcQsHgpNrvORE-RY7mFhZGsPqBH0ha-Ys_JE4IZmUWEXYAzsGamymZMdusoXxa3g1qMGsJiePbJdsejeV24DwN0',
      rating: 5,
    },
    {
      quote:
        '\"HWstore est notre fournisseur IT officiel depuis 2 ans. Leur expertise sur les serveurs a permis de stabiliser notre infrastructure réseau.\"',
      name: 'Amel R.',
      role: 'Directrice IT, TechSolutions',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBdodeJ1yY8XEoX-FRi6gRLjaf2t4sGSqWRtsm5RkZjf3mr-vYMO8mRrMntnzUBlM-XIV2SREOL4wnxNAzwN04RurP-Jq18P9Khy-0epYpCFN_5hk5rqPfbw4_hm2DibJ5ZyKczCcJvmM3Fg-Rq03LZ86v2vf3iiiVC9_Qp_uY1t4rPKUevWiwNs8lYNTaN5AXEx-NV1guNQwlxnjpEOeA4njOb-IvtpLOtjll81CfYT-2HB9EkL0wNpJ-_yHOzAEJNFfwUooUZxuw',
      rating: 5,
    },
    {
      quote:
        '\"Des prix honnêtes et des composants authentiques. C\'est rare de trouver cette qualité de service en Algérie. Je recommande vivement !\"',
      name: 'Mohamed B.',
      role: 'Architecte Digital',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDknSuGU5z-lrr_J0QfTpl91Uny8ZPP7Q0__nuogD7yuDJ3RGImj1vB9h--ddNyoFY8hkPZJ4rRauRUZE4S1Aeas-PCxeJtkKn_Bzok7CmMZmKxOsxcUgHJUMhlnog8yys25Tf160C2rwaD78cPsWTitI825tYgzaD8UDOLv_qRh__OuedBGPUxwfDDLmX9O-EEut3qMgH_rnmdrIxDTq-SWzl16SKpGNJkZwiUn-w9AZiT9YYqaMebZxdQkrWz5BpecdimP59UADk',
      rating: 5,
    },
  ];

  ngOnInit(): void {
    this.clientService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data.slice(0, 6));
        this.isLoading.set(false);
      },
    });
    this.clientService.getComposants({ limit: 4 }).subscribe({
      next: (res) => {
        this.bestSellers.set(res.data.slice(0, 4));
      },
    });
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1,
      },
    ];
    this.isLoading.set(false);
  }

  getSeverity(status: string) {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warn';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return undefined;
    }
  }

  getStars(rating: number): boolean[] {
    const r = Math.round(rating);
    return Array(5)
      .fill(false)
      .map((_, i) => i < r);
  }
}
