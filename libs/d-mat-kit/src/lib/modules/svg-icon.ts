import { NgModule, inject } from "@angular/core";
import { DSvgIconRegister } from "../services/svg-icon-register";

@NgModule({
  providers: [DSvgIconRegister],
})
export class DSvgIconModule {
  constructor() {
    inject(DSvgIconRegister);
  }
}