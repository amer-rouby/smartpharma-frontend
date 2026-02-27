import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../shared/material.module';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface GuideSection {
  title: string;
  icon: string;
  topics: GuideTopic[];
}

interface GuideTopic {
  title: string;
  content: string;
  steps?: string[];
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly selectedTab = signal(0);
  readonly expandedFaqIndex = signal<number | null>(null);
  readonly searchQuery = signal('');

  contactForm: FormGroup;

  readonly faqItems: FAQItem[] = [
    {
      category: 'products',
      question: 'HELP.FAQ.ADD_PRODUCT',
      answer: 'HELP.FAQ.ADD_PRODUCT_ANSWER'
    },
    {
      category: 'products',
      question: 'HELP.FAQ.EDIT_PRODUCT',
      answer: 'HELP.FAQ.EDIT_PRODUCT_ANSWER'
    },
    {
      category: 'sales',
      question: 'HELP.FAQ.CREATE_SALE',
      answer: 'HELP.FAQ.CREATE_SALE_ANSWER'
    },
    {
      category: 'sales',
      question: 'HELP.FAQ.RETURN_SALE',
      answer: 'HELP.FAQ.RETURN_SALE_ANSWER'
    },
    {
      category: 'stock',
      question: 'HELP.FAQ.LOW_STOCK',
      answer: 'HELP.FAQ.LOW_STOCK_ANSWER'
    },
    {
      category: 'stock',
      question: 'HELP.FAQ.EXPIRED_PRODUCTS',
      answer: 'HELP.FAQ.EXPIRED_PRODUCTS_ANSWER'
    },
    {
      category: 'reports',
      question: 'HELP.FAQ.GENERATE_REPORT',
      answer: 'HELP.FAQ.GENERATE_REPORT_ANSWER'
    },
    {
      category: 'users',
      question: 'HELP.FAQ.ADD_USER',
      answer: 'HELP.FAQ.ADD_USER_ANSWER'
    }
  ];

  readonly guides: GuideSection[] = [
    {
      title: 'HELP.GUIDES.PRODUCTS',
      icon: 'inventory_2',
      topics: [
        {
          title: 'HELP.GUIDES.ADD_PRODUCT_TITLE',
          content: 'HELP.GUIDES.ADD_PRODUCT_CONTENT',
          steps: [
            'HELP.GUIDES.STEPS.OPEN_PRODUCTS',
            'HELP.GUIDES.STEPS.CLICK_ADD',
            'HELP.GUIDES.STEPS.FILL_INFO',
            'HELP.GUIDES.STEPS.SAVE'
          ]
        },
        {
          title: 'HELP.GUIDES.MANAGE_STOCK_TITLE',
          content: 'HELP.GUIDES.MANAGE_STOCK_CONTENT',
          steps: [
            'HELP.GUIDES.STEPS.OPEN_STOCK',
            'HELP.GUIDES.STEPS.SELECT_PRODUCT',
            'HELP.GUIDES.STEPS.ADJUST_QUANTITY',
            'HELP.GUIDES.STEPS.CONFIRM'
          ]
        }
      ]
    },
    {
      title: 'HELP.GUIDES.SALES',
      icon: 'shopping_cart',
      topics: [
        {
          title: 'HELP.GUIDES.CREATE_SALE_TITLE',
          content: 'HELP.GUIDES.CREATE_SALE_CONTENT',
          steps: [
            'HELP.GUIDES.STEPS.OPEN_POS',
            'HELP.GUIDES.STEPS.SEARCH_PRODUCT',
            'HELP.GUIDES.STEPS.ADD_TO_CART',
            'HELP.GUIDES.STEPS.COMPLETE_SALE'
          ]
        }
      ]
    },
    {
      title: 'HELP.GUIDES.REPORTS',
      icon: 'assessment',
      topics: [
        {
          title: 'HELP.GUIDES.GENERATE_REPORT_TITLE',
          content: 'HELP.GUIDES.GENERATE_REPORT_CONTENT',
          steps: [
            'HELP.GUIDES.STEPS.OPEN_REPORTS',
            'HELP.GUIDES.STEPS.SELECT_TYPE',
            'HELP.GUIDES.STEPS.SET_DATE',
            'HELP.GUIDES.STEPS.GENERATE'
          ]
        }
      ]
    }
  ];

  readonly keyboardShortcuts = [
    { key: 'Ctrl + N', description: 'HELP.SHORTCUTS.NEW_SALE' },
    { key: 'Ctrl + P', description: 'HELP.SHORTCUTS.NEW_PRODUCT' },
    { key: 'Ctrl + S', description: 'HELP.SHORTCUTS.SEARCH' },
    { key: 'F2', description: 'HELP.SHORTCUTS.EDIT' },
    { key: 'Delete', description: 'HELP.SHORTCUTS.DELETE' },
    { key: 'Ctrl + R', description: 'HELP.SHORTCUTS.REFRESH' },
    { key: 'Esc', description: 'HELP.SHORTCUTS.CANCEL' },
    { key: 'Enter', description: 'HELP.SHORTCUTS.SAVE' }
  ];

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onFaqClick(index: number): void {
    this.expandedFaqIndex.set(this.expandedFaqIndex() === index ? null : index);
  }

  onSubmitContact(): void {
    if (this.contactForm.invalid) {
      this.snackBar.open(
        this.translate.instant('HELP.CONTACT_FORM_ERROR'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
      return;
    }

    this.snackBar.open(
      this.translate.instant('HELP.CONTACT_FORM_SUCCESS'),
      this.translate.instant('COMMON.CLOSE'),
      { duration: 3000, panelClass: ['success-snackbar'] }
    );

    this.contactForm.reset();
  }

  getFilteredFaqs(): FAQItem[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.faqItems;

    return this.faqItems.filter(item =>
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query)
    );
  }
}
