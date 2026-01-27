import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({ providedIn: 'root' })
export class ExcelExportService {
  exportAsXlsx(filename: string, rows: Record<string, unknown>[], sheetName = 'Export') {
    const safeName = filename.toLowerCase().endsWith('.xlsx') ? filename : `${filename}.xlsx`;

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    XLSX.writeFile(workbook, safeName);
  }
}
