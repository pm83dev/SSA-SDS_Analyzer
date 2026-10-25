import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScenarioService, ExpiringCard } from '../../../core/services/scenario.service';

@Component({
  selector: 'app-scenarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scenarios.component.html',
  styleUrl: './scenarios.component.css'
})
export class ScenariosComponent implements OnInit {
  expiring: ExpiringCard[] = [];
  isLoading = true;
  selectedDays = 90;
  warningCount = 0;
  expiredCount = 0;

  constructor(
    private scenarioService: ScenarioService
  ) {}

  ngOnInit() {
    this.loadExpiring();
  }

  private loadExpiring() {
    this.isLoading = true;
    this.scenarioService.getExpiring(this.selectedDays).subscribe({
      next: (cards) => {
        this.expiring = cards;
        this.expiredCount = cards.filter(c => (c.daysRemaining ?? 0) < 0).length;
        this.warningCount = cards.filter(c => (c.daysRemaining ?? 999) >= 0 && (c.daysRemaining ?? 999) <= 30).length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.expiring = [];
      }
    });
  }

  onFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedDays = parseInt(target.value, 10);
    this.loadExpiring();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Valid': return 'badge-valid';
      case 'Expiring': return 'badge-expiring';
      case 'Expired': return 'badge-expired';
      default: return 'badge-valid';
    }
  }
}
