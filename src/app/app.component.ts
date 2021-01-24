import { Component, OnInit } from '@angular/core';

declare let MathJax: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'rps-calculator';
  isGenerated = false;
  nx = 2;
  ny = 3;

  X = ["-1", "0"]
  Y = ["-2", "0", "1"]

  PX: number[];
  PY: number[];

  EX: number;
  EY: number;
  EX2: number;
  EY2: number;
  VarX: number;
  VarY: number;
  EXY:number;
  CovXY:number;

  dataRows: string[][];

  constructor() { }

  ngOnInit() {
    this.dataRows = [
      ["1/8", "0"],
      ["1/4", "3/8"],
      ["0", "1/4"],
    ];

    this.generate();
  }

  public addX() {
    this.nx++;
    this.dataRows.forEach(row => { row.push("0"); });
    this.X.push("0")
  }
  public subX() {
    if (this.nx < 2) { return; }
    this.nx--;
    this.dataRows.forEach(row => { row.pop(); });
    this.X.pop();
  }
  public addY() {
    this.ny++;
    this.dataRows.push(new Array(this.nx).fill("0"));
    this.Y.push("0");
  }
  public subY() {
    if (this.ny < 2) { return; }
    this.ny--;
    this.dataRows.pop();
    this.Y.pop();
  }

  // To musi siedzieć, inaczej tracę focus z głównej tablicy.
  trackByFn(index: any, item: any) {
    return index;
  }
  public onValueChange(i, j, value, event) {
    try {
      eval(value);
    }
    catch {
      return;
    }

    this.dataRows[j][i] = value;
    this.generate();
  }

  public getMeanValue(X: string[], PX: number[]): number {
    let sum = 0;
    for (let i = 0; i < X.length; i++) {
      sum += eval(X[i]) * PX[i];
    }
    return sum;
  }

  public getMeanValue2(X: string[], PX: number[]): number {
    let sum = 0;
    for (let i = 0; i < X.length; i++) {
      sum += eval(X[i]) * eval(X[i]) * PX[i];
    }
    return sum;
  }

  public generate() {
    this.isGenerated = false;

    this.PX = this.generatePX();
    this.PY = this.generatePY();
    this.EX = this.getMeanValue(this.X, this.PX);
    this.EY = this.getMeanValue(this.Y, this.PY);
    this.EX2 = this.getMeanValue2(this.X, this.PX);
    this.EY2 = this.getMeanValue2(this.Y, this.PY);
    this.VarX = this.EX2 - (this.EX) * this.EX;
    this.VarY = this.EY2 - this.EY * this.EY;

    setTimeout(() => {

      MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
      this.isGenerated = true;
    }, 400);
  }

  public generatePX() {
    let arr = [];
    for (let i = 0; i < this.nx; i++) {
      let sum = 0;
      for (let j = 0; j < this.ny; j++) {
        sum += eval(this.dataRows[j][i]);
      }
      arr.push(sum);
    }
    return arr;
  }
  public generatePY() {
    let arr = [];
    for (let i = 0; i < this.ny; i++) {
      let sum = 0;
      for (let j = 0; j < this.nx; j++) {
        sum += eval(this.dataRows[i][j]);
      }
      arr.push(sum);
    }
    return arr;
  }


}
