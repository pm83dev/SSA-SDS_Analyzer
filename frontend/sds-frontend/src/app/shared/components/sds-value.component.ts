import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafetyCard } from '../../core/models/safety-card.model';
import {
  SdsField, sdsValue, splitCodes, frasiHDescription, isKnownHCode,
  normalizeGhs, ghsDescription, extractCas, componentNames, minTeb, densityGcm3, isToVerify, verifyReasons
} from '../../core/models/sds-fields';

// Mostra il valore di una colonna del file "dati per SDS.xlsx" nello stesso modo
// nella tabella (mode="cell") e nella scheda di dettaglio (mode="detail").
@Component({
  selector: 'app-sds-value',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span *ngIf="toVerify" class="verify-tag" [title]="reasonsText">⚠ da verificare</span>
    <div *ngIf="toVerify && mode === 'detail'" class="verify-reason">{{ reasonsText }}</div>
    <ng-container [ngSwitch]="field.kind">
      <ng-container *ngSwitchCase="'client'">
        <div class="client-list">
          <span *ngFor="let c of card.clients" class="client-ref"><span class="client-id">{{ c.id }}</span> {{ c.ragioneSociale }}</span>
          <span *ngIf="!card.clients.length" class="empty" title="Scheda non collegata a nessun cliente">archivio</span>
        </div>
      </ng-container>

      <div *ngSwitchCase="'hcodes'" class="codes">
        <span *ngFor="let code of codes" class="code-tag"
              [class.code-unknown]="!isKnownHCode(code)"
              [title]="code + ' – ' + frasiHDescription(code)">{{ code }}</span>
        <ul *ngIf="mode === 'detail' && codes.length" class="h-desc">
          <li *ngFor="let code of codes"><strong>{{ code }}</strong> – {{ frasiHDescription(code) }}</li>
        </ul>
        <span *ngIf="!codes.length" class="empty">-</span>
      </div>

      <div *ngSwitchCase="'ghs'" class="codes">
        <span *ngFor="let code of codes" class="code-tag code-ghs" [class.code-unknown]="!ghsDescription(code)"
              [title]="normalizeGhs(code) + ' – ' + (ghsDescription(code) || 'Codice non presente nel foglio Pittogrammi')">{{ normalizeGhs(code) }}</span>
        <span *ngIf="!codes.length" class="empty">-</span>
      </div>

      <div *ngSwitchCase="'cas'" class="codes" [title]="text">
        <span *ngFor="let cas of casNumbers" class="code-tag code-cas">{{ cas }}</span>
        <span *ngIf="!casNumbers.length" class="empty">{{ text ? 'n.d.' : '-' }}</span>
      </div>

      <ng-container *ngSwitchCase="'names'">
        <ul *ngIf="names.length; else empty" class="comp-list" [title]="text">
          <li *ngFor="let n of names">{{ n }}</li>
        </ul>
      </ng-container>

      <ng-container *ngSwitchCase="'teb'">
        <span *ngIf="text; else empty" [title]="text">{{ minTeb(text) }}</span>
      </ng-container>

      <ng-container *ngSwitchCase="'density'">
        <span *ngIf="text; else empty" [title]="text">{{ densityGcm3(text) }}</span>
      </ng-container>

      <ng-container *ngSwitchCase="'file'">
        <span *ngIf="text; else empty" class="file-name">{{ text }}</span>
      </ng-container>

      <ng-container *ngSwitchCase="'bool'">
        <span *ngIf="value === true" class="badge-yes">Sì</span>
        <span *ngIf="value === false">No</span>
        <span *ngIf="value !== true && value !== false" class="empty">-</span>
      </ng-container>

      <div *ngSwitchCase="'url'" class="sds-links">
        <a *ngIf="isUrl" [href]="text" target="_blank" rel="noopener" (click)="$event.stopPropagation()">
          {{ mode === 'cell' ? 'Link' : text }}
        </a>
        <span *ngIf="text && !isUrl">{{ text }}</span>
        <a *ngIf="card.hasPdf && card.pdfUrl" href="#" class="pdf-link"
           (click)="$event.preventDefault(); $event.stopPropagation(); openPdf.emit(card)">PDF allegato</a>
        <span *ngIf="!text && !card.hasPdf" class="empty">-</span>
      </div>

      <ng-container *ngSwitchCase="'date'">
        <span *ngIf="value; else empty">{{ $any(value) | date:'dd/MM/yyyy' }}</span>
      </ng-container>

      <ng-container *ngSwitchDefault>
        <span *ngIf="text; else empty">{{ text }}</span>
      </ng-container>
    </ng-container>
    <ng-template #empty><span class="empty">-</span></ng-template>
  `,
  styles: [`
    :host { display: block; overflow-wrap: break-word; }
    .verify-tag {
      display: inline-block;
      margin-bottom: 3px;
      padding: 1px 6px;
      border-radius: 4px;
      background: #fff3cd;
      color: #8a5a00;
      border: 1px solid #f0c36d;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      cursor: help;
    }
    .verify-reason { margin: 2px 0 6px; font-size: 12px; color: #8a5a00; white-space: pre-line; }
    .client-id {
      display: inline-block;
      min-width: 22px;
      padding: 0 5px;
      border-radius: 4px;
      background: #eef2f7;
      font-size: 12px;
      font-weight: 700;
      text-align: center;
    }
    .codes { display: flex; flex-wrap: wrap; gap: 4px; }
    .client-list { display: flex; flex-direction: column; gap: 2px; }
    .client-ref { white-space: nowrap; }
    .code-tag {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      background: #eef2f7;
      color: #2c3e50;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
      cursor: help;
    }
    .code-unknown { outline: 1px dashed #e74c3c; }
    .code-ghs { background: #fdecea; color: #a93226; }
    .code-cas { background: #eef7f0; color: #1e6b3a; font-family: Consolas, monospace; }
    .file-name { font-size: 12px; color: #555; }
    .h-desc { width: 100%; margin: 8px 0 0; padding-left: 18px; font-size: 13px; }
    .comp-list { margin: 0; padding-left: 16px; font-size: 13px; }
    .comp-list li { margin-bottom: 2px; }
    .pre-wrap { white-space: pre-wrap; }
    .badge-yes {
      padding: 2px 8px;
      border-radius: 10px;
      background: #fff3cd;
      color: #856404;
      font-weight: 600;
      font-size: 12px;
    }
    .sds-links { display: flex; flex-direction: column; gap: 2px; }
    .sds-links a { color: #3498db; font-weight: 600; font-size: 13px; overflow-wrap: anywhere; }
    .empty { color: #bbb; }
  `]
})
export class SdsValueComponent {
  @Input({ required: true }) card!: SafetyCard;
  @Input({ required: true }) field!: SdsField;
  @Input() mode: 'cell' | 'detail' = 'cell';
  @Output() openPdf = new EventEmitter<SafetyCard>();

  protected readonly frasiHDescription = frasiHDescription;
  protected readonly isKnownHCode = isKnownHCode;
  protected readonly normalizeGhs = normalizeGhs;
  protected readonly ghsDescription = ghsDescription;
  protected readonly minTeb = minTeb;
  protected readonly densityGcm3 = densityGcm3;

  // Il dato non è stato ritrovato nel testo della SDS durante l'import: va controllato sulla scheda
  @HostBinding('class.to-verify')
  get toVerify(): boolean {
    return isToVerify(this.card, this.field.key);
  }

  get reasonsText(): string {
    return verifyReasons(this.card, this.field.key).join('\n') || 'Dato non verificato nel testo della SDS';
  }

  get value(): unknown {
    return sdsValue(this.card, this.field.key);
  }

  get text(): string {
    const v = this.value;
    return v === null || v === undefined ? '' : String(v);
  }

  get codes(): string[] {
    return splitCodes(this.text);
  }

  get casNumbers(): string[] {
    return extractCas(this.text);
  }

  // La colonna Composizione mostra solo i nomi dei componenti
  get names(): string[] {
    return componentNames(this.card);
  }

  get isUrl(): boolean {
    return /^https?:\/\//i.test(this.text);
  }
}
