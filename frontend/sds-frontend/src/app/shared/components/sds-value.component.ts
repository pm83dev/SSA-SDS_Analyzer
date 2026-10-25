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
  templateUrl: './sds-value.component.html',
  styleUrl: './sds-value.component.css'
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
