import { NgModule } from '@angular/core';
import { DTable } from '../components/table/table';
import {
  DAltHeaderCell,
  DAltHeaderCellDef,
  DAltHeaderRow,
  DCell,
  DCellDef,
  DExpandableCell,
  DExpandableRowDef,
  DFooterCell,
  DFooterCellDef,
  DFooterRow,
  DHeaderCell,
  DHeaderCellDef,
} from '../directives';
import { MatTableModule } from '@angular/material/table';

const moduleItems = [
  MatTableModule,
  DTable,
  DExpandableRowDef,
  DExpandableCell,
  DAltHeaderRow,
  DAltHeaderCellDef,
  DAltHeaderCell,
  DHeaderCellDef,
  DHeaderCell,
  DCellDef,
  DCell,
  DFooterRow,
  DFooterCellDef,
  DFooterCell,
];

@NgModule({
  declarations: [],
  imports: moduleItems,
  exports: moduleItems,
})
export class DTableModule {}
