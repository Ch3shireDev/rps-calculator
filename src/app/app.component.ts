import { Component, OnInit } from '@angular/core';

declare let MathJax: any;
declare let math: any;

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

  PX: any[];
  PY: any[];

  EX: any;
  EXs: any;
  EY: any;
  EYs: any;
  EX2: any;
  EX2s: any;
  EY2: any;
  EY2s: any;
  VarX: any;
  VarXs: any;
  VarY: any;
  VarYs: any;
  EXY: any;
  CovXY: any;
  sigmax: any;
  sigmaxs: any;
  sigmay: any;
  sigmays: any;
  rhoXY: any;
  rhoXYs: string;
  dataRows: string[][];

  Z: any[];
  PZ: any[];
  W: any[];
  PW: any[];

  constructor() { }

  ngOnInit() {
    this.dataRows = [
      ["1/8", "0"],
      ["1/4", "3/8"],
      ["0", "1/4"],
    ];

    this.generate();
  }

  public setVar(X, i, value) {
    X[i] = value;
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

  public getMeanValue(X: string[], PX: any[]): string[] {
    let sum = [];
    for (let i = 0; i < X.length; i++) {
      sum.push(`${X[i]} * ${PX[i]}`);
    }
    let x = sum.join("+");
    return [x.replace(/\*/gi, '\\cdot'), math.simplify(x)];
  }

  public getMeanValue2(X: string[], PX: any[]): any {
    let sum = [];
    for (let i = 0; i < X.length; i++) {
      sum.push(`${X[i]}*${X[i]} * ${PX[i]}`);
    }
    let x = sum.join('+');
    return [x.replace(/\*/gi, "\\cdot"), math.simplify(x)];
  }

  public generate() {
    this.isGenerated = false;

    this.PX = this.generatePX();
    this.PY = this.generatePY();
    [this.EXs, this.EX] = this.getMeanValue(this.X, this.PX);
    [this.EYs, this.EY] = this.getMeanValue(this.Y, this.PY);
    [this.EX2s, this.EX2] = this.getMeanValue2(this.X, this.PX);
    [this.EY2s, this.EY2] = this.getMeanValue2(this.Y, this.PY);
    this.VarXs = `${this.EX2} - (${this.EX})^2`;
    this.VarX = math.simplify(this.VarXs);
    this.sigmaxs = `\\sqrt{${this.VarX}}`;
    this.sigmax = math.format(math.simplify(`sqrt(${this.VarX})`), { precision: 3 });
    this.VarYs = `${this.EY2} - (${this.EY})^2`;
    this.VarY = math.simplify(this.VarYs);
    this.sigmays = `\\sqrt{${this.VarY}}`;
    this.sigmay = math.format(math.simplify(`sqrt(${this.VarY})`), { precision: 3 });

    this.EXY = this.getEXY();



    this.CovXY = math.format(math.simplify(`${this.EXY}-(${this.EX})*(${this.EY})`), { precision: 3 });
    this.rhoXY = math.format(math.simplify(`(${this.CovXY})/(sqrt(${this.VarX})*sqrt(${this.VarY}))`), { precision: 3 });
    this.rhoXYs = `\\frac{${this.CovXY}}{\\sqrt{${this.VarX}}\\cdot\\sqrt{${this.VarY}}}`;

    [this.Z, this.PZ] = this.generatePZ();
    [this.W, this.PW] = this.generatePW();
    this.renderMath();
  }

  public getEXY() {
    let sum = [];
    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.ny; j++) {
        sum.push(`${this.X[i]}*${this.Y[j]}*${this.dataRows[j][i]}`)
      }
    }
    return math.simplify(sum.join('+'));
  }

  public generatePZ(): any[][] {
    let data = {};

    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.ny; j++) {
        let x = this.X[i];
        let y = this.Y[j];
        let z = math.simplify(`${x}+${y}`);
        let p = this.dataRows[j][i];
        if (z in data) {
          data[z] += "+" + p;
          data[z] = math.simplify(data[z]);
        }
        else {
          data[z] = p;
        }
      }
    }

    let list = [];

    for (var key in data) {
      list.push({ key: key, value: data[key] });
    }

    list.sort((a, b) => a["key"] - b["key"]);

    let Z = []
    let PZ = []

    for (var i = 0; i < list.length; i++) {
      Z.push(list[i]["key"]);
      PZ.push(list[i]["value"]);
    }

    return [Z, PZ];
  }

  public generatePW(): any[][] {
    let data = {};

    for (let i = 0; i < this.nx; i++) {
      for (let j = 0; j < this.ny; j++) {
        let x = this.X[i];
        let y = this.Y[j];
        let z = math.simplify(`${x}*${y}`);
        let p = this.dataRows[j][i];
        if (z in data) {
          data[z] += "+" + p;
          data[z] = math.simplify(data[z]);
        }
        else {
          data[z] = p;
        }
      }
    }

    let list = [];

    for (var key in data) {
      list.push({ key: key, value: data[key] });
    }

    list.sort((a, b) => a["key"] - b["key"]);

    let W = []
    let PW = []

    for (var i = 0; i < list.length; i++) {
      W.push(list[i]["key"]);
      PW.push(list[i]["value"]);
    }

    return [W, PW];
  }

  public renderMath() {
    setTimeout(() => {
      MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
      this.isGenerated = true;
    }, 400);
  }

  public generatePX() {
    let arr = [];
    for (let i = 0; i < this.nx; i++) {
      let sum = [];
      for (let j = 0; j < this.ny; j++) {
        sum.push(this.dataRows[j][i]);
      }
      arr.push(math.simplify(sum.join('+')));
    }
    return arr;
  }
  public generatePY() {
    let arr = [];
    for (let i = 0; i < this.ny; i++) {
      let sum = [];
      for (let j = 0; j < this.nx; j++) {
        sum.push(this.dataRows[i][j]);
      }
      arr.push(math.simplify(sum.join("+")));
    }
    return arr;
  }

  public multiply(px, py): string {
    return math.simplify(`${px}*${py}`);
  }


}
