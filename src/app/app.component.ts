import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import Chart, { ChartConfiguration } from 'chart.js/auto';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class AppComponent implements OnInit {
  title = 'expense-calc';
  data = []
  financeForm: FormGroup;
  dateList: string[] = [];
  testStartBalance: number;
  projectedBalance: number[] = [];
  accountMap: Map<string, number> = new Map();
  showChart: boolean = false;
  chart1: Chart;

  constructor(private fb: FormBuilder) {}

  get budgetItems() {
    return this.financeForm.controls["BudgetItems"] as FormArray;
  }
  
  get incomeItems() {
    return this.financeForm.controls["IncomeItems"] as FormArray;
  }

  ngOnInit() {
    this.financeForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      startingBalance: ['', Validators.required],
      BudgetItems: this.fb.array([]),
      IncomeItems: this.fb.array([])
    });
  }

  addOngoingItemForm(type: 'budget' | 'income') {
    let formGroup;
    if (type === 'budget') {
      formGroup = this.fb.group({
        title: [''],
        payment: [''],
        dueDate: ['']
      });
      (this.financeForm.controls['BudgetItems'] as FormArray).push(formGroup);
    }
    else if (type === 'income') {
      formGroup = this.fb.group({
        title: [''],
        amount: [''],
        frequency: ['biweekly'],
        recentPaymentDate: ['']
      });
      (this.financeForm.controls['IncomeItems'] as FormArray).push(formGroup);
    }
  }

  removeItem(type: 'budget' | 'income', index: number) {
    const formArray = this.financeForm.controls[type === 'budget' ? 'BudgetItems' : 'IncomeItems'] as FormArray;
    formArray.removeAt(index);
  }

  projectBudget(event: Event) {
    event.preventDefault();
    this.projectedBalance = [];

    const startDateVal = this.financeForm.get('startDate');
    let start = new Date(this.financeForm.get('startDate')!.value)
    let end = new Date(this.financeForm.get('endDate')!.value);
    let diff = this.calcDaysDiff(start, end);
    this.dateList = this.getDateArray(start, diff);
    let tempMainBalance = this.financeForm.controls['startingBalance'].value;

    for (const date of this.dateList) {
      const currentDate = this.getDateFromString(date);
      //Process budget items
      for (const budgetItem of this.financeForm.controls['BudgetItems'].value) {
        const paymentDate = this.getDateFromString(this.formatCalendarDateString(budgetItem.dueDate));
        tempMainBalance = this.calculateNewBalanceForBudgetItemForDate(tempMainBalance, budgetItem.payment, currentDate, paymentDate.getDate())
      }

      //Process income items
      for (const incomeItem of this.financeForm.controls['IncomeItems'].value) {
        const recentPaymentDate = this.getDateFromString(this.formatCalendarDateString(incomeItem.recentPaymentDate));
        const frequencyMultiplier = incomeItem.frequency === 'biweekly' ? 2 : 4;
          if (this.dateIsOnInterval(currentDate, recentPaymentDate, 7 * frequencyMultiplier)) {
          tempMainBalance += incomeItem.amount;
        }
      }
      this.projectedBalance.push(tempMainBalance);
    }
    this.enableChart();
  }

  private calcDaysDiff(start: Date, end: Date) {
    let diff = Math.abs(end.valueOf() - start.valueOf());
    return Math.floor(diff / (1000 * 3600 * 24));
  }

  private addDaysToDate(startDate: Date, duration: number): Date {
    startDate.setDate(startDate.getDate() + duration);
    return startDate;
  }

  private getDateArray(startDate: Date, duration: number): string[] {
    let dates: string[] = [];
    for(let i = 0; i <= duration; i++) {
      startDate = this.addDaysToDate(startDate, 1);
      dates.push(startDate.toLocaleDateString());
    }
    return dates;
  }

  //Convert from 'yyyy-dd-mm' to 'mm/dd/yyyy'
  private formatCalendarDateString(calendarDateString: string): string {
    const components = calendarDateString.split('-');
    const output = components[1] + '/' + components[2] + '/' + components[0];
    return output;
  }

  private getDateFromString(dateString: string): Date {
    return new Date(Date.parse(dateString));
  }

  private calculateNewBalanceForBudgetItemForDate(currentBalance: number, payment: number, projectionDate: Date, dayOfPayment: number): number {
    const test = projectionDate.getDate() === dayOfPayment;
    return test ? currentBalance - payment : currentBalance;
  }

  private dateIsOnInterval(currentDate: Date, startDate: Date, interval: number): boolean {
    let diff = this.calcDaysDiff(startDate, currentDate);
    return diff % interval === 0;
  }

  private enableChart() {
    const chartElement = document.getElementById('chart-1') as HTMLCanvasElement;
    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.dateList,
        datasets: [
          {
            label: "Primary Account",
            data: this.projectedBalance
          }
        ]
      }
    };
    if (this.chart1)
      this.chart1.destroy();
    this.chart1 = new Chart(chartElement, chartConfig);
    this.showChart = true;
  }

  public addHardcodedBudget() {
    this.addBudgetItemFormGroupWithValues("Hospital", 176, "2024-03-01");
    this.addBudgetItemFormGroupWithValues("COTN", 39, "2024-03-03");
    this.addBudgetItemFormGroupWithValues("Slate CC", 550, "2024-03-13");
    this.addBudgetItemFormGroupWithValues("BCC Tuition", 280, "2024-03-15");
    this.addBudgetItemFormGroupWithValues("WM", 80, "2024-03-22");
    this.addBudgetItemFormGroupWithValues("Astound", 99, "2024-03-24");
    this.addBudgetItemFormGroupWithValues("HELOC", 1500, "2024-03-25");
    this.addBudgetItemFormGroupWithValues("Peninsula CC", 48, "2024-03-25");
    this.addBudgetItemFormGroupWithValues("Cory's CC", 40, "2024-03-26");
    this.addBudgetItemFormGroupWithValues("Student Loan", 166, "2024-03-28");
    this.addBudgetItemFormGroupWithValues("Verizon", 60, "2024-03-29");
    this.addBudgetItemFormGroupWithValues("Netflix", 13, "2024-03-29");
    this.addIncomeFormGroupWithValues("Cory's paycheck", 2947, "2024-02-16");
  }

  private addBudgetItemFormGroupWithValues(title: string, payment: number, dueDate: string): void {
    let formGroup = this.fb.group({
      title: [title],
      payment: [payment],
      dueDate: [dueDate]
    });
    (this.financeForm.controls['BudgetItems'] as FormArray).push(formGroup);
  }

  private addIncomeFormGroupWithValues(title: string, payment: number, paymentReference: string): void {
    let formGroup = this.fb.group({
      title: [title],
      amount: [payment],
      frequency: ['biweekly'],
      recentPaymentDate: [paymentReference]
    });
    (this.financeForm.controls['IncomeItems'] as FormArray).push(formGroup);
  }
}
