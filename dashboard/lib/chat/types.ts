/** Tombol aksi di bawah jawaban: mengubah filter dashboard dan/atau berpindah halaman. */
export interface ChatAction {
  label: string;
  href?: string;
  search?: string;
  provinsi?: string;
  cluster?: 0 | 1 | 2 | 3;
}

export interface ChatReply {
  reply: string;
  actions?: ChatAction[];
  /** "cepat" = dihitung langsung dari data tanpa AI */
  source?: "cepat" | "ai";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
