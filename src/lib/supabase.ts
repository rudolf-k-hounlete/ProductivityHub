import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database service functions
export class DatabaseService {
  // Notes
  static async getNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createNote(note: any) {
    const { data, error } = await supabase
      .from('notes')
      .insert([note])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateNote(id: string, updates: any) {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteNote(id: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Tasks
  static async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createTask(task: any) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateTask(id: string, updates: any) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Projects
  static async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createProject(project: any) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProject(id: string, updates: any) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Events
  static async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async createEvent(event: any) {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateEvent(id: string, updates: any) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteEvent(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Financial Transactions
  static async getFinancialTransactions() {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createFinancialTransaction(transaction: any) {
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert([transaction])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateFinancialTransaction(id: string, updates: any) {
    const { data, error } = await supabase
      .from('financial_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteFinancialTransaction(id: string) {
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Books
  static async getBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createBook(book: any) {
    const { data, error } = await supabase
      .from('books')
      .insert([book])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateBook(id: string, updates: any) {
    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteBook(id: string) {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Goals
  static async getGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createGoal(goal: any) {
    const { data, error } = await supabase
      .from('goals')
      .insert([goal])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateGoal(id: string, updates: any) {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteGoal(id: string) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Journal Entries
  static async getJournalEntries() {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createJournalEntry(entry: any) {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([entry])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateJournalEntry(id: string, updates: any) {
    const { data, error } = await supabase
      .from('journal_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteJournalEntry(id: string) {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Prayers
  static async getPrayers() {
    const { data, error } = await supabase
      .from('prayers')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createPrayer(prayer: any) {
    const { data, error } = await supabase
      .from('prayers')
      .insert([prayer])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updatePrayer(id: string, updates: any) {
    const { data, error } = await supabase
      .from('prayers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deletePrayer(id: string) {
    const { error } = await supabase
      .from('prayers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Bible Readings
  static async getBibleReadings() {
    const { data, error } = await supabase
      .from('bible_readings')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createBibleReading(reading: any) {
    const { data, error } = await supabase
      .from('bible_readings')
      .insert([reading])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateBibleReading(id: string, updates: any) {
    const { data, error } = await supabase
      .from('bible_readings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteBibleReading(id: string) {
    const { error } = await supabase
      .from('bible_readings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Academic Courses
  static async getAcademicCourses() {
    const { data, error } = await supabase
      .from('academic_courses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createAcademicCourse(course: any) {
    const { data, error } = await supabase
      .from('academic_courses')
      .insert([course])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateAcademicCourse(id: string, updates: any) {
    const { data, error } = await supabase
      .from('academic_courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteAcademicCourse(id: string) {
    const { error } = await supabase
      .from('academic_courses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}