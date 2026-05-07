export type Plan = "hobby" | "builder" | "studio";
export type ProjectStatus = "draft" | "generating" | "ready" | "error";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          plan: Plan;
          credits_balance: number;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          plan?: Plan;
          credits_balance?: number;
          created_at?: string;
        };
        Update: {
          plan?: Plan;
          credits_balance?: number;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          prompt: string;
          mcq_answers: Record<string, string>;
          status: ProjectStatus;
          scaffold_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          prompt: string;
          mcq_answers: Record<string, string>;
          status?: ProjectStatus;
          scaffold_type?: string;
        };
        Update: {
          name?: string;
          status?: ProjectStatus;
          updated_at?: string;
        };
      };
      project_files: {
        Row: {
          id: string;
          project_id: string;
          path: string;
          content: string;
          updated_at: string;
        };
        Insert: {
          project_id: string;
          path: string;
          content: string;
        };
        Update: {
          content?: string;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          delta: number;
          reason: string;
          project_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          delta: number;
          reason: string;
          project_id?: string | null;
        };
      };
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectFile = Database["public"]["Tables"]["project_files"]["Row"];
