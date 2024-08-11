function generateCSV(data: any[]): string {
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","), // CSV header row
    ...data.map((row) =>
      headers.map((header) => JSON.stringify(row[header])).join(","),
    ),
  ];
  return csvRows.join("\n");
}

export function downloadCSV(data: any[], filename: string): void {
  const csv = generateCSV(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
