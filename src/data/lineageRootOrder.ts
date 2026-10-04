export const lineageRootOrder: Partial<Record<string, string[]>> = {
  // Na Grande Árvore, posicione primeiro a ascendência de Kaeden. Assim, o
  // casal Hazel–Kaeden é ancorado pelos Aranthor e apenas conectado aos Kunst
  // pelo lado de Hazel, sem fazer o ramo de Kaeden nascer dos Kunst.
  kunst: ["manelaus-aranthor", "malrec-kunst", "gerold-kunst", "liora-kunst", "malakor-vorthos"],
  aranthor: ["manelaus-aranthor"],
};
