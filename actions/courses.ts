"use server";

import { supabase } from "@/lib/supabase";
import type { Course } from "@/lib/types";

export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export type CourseInput = {
  name: string;
  semester: string | null;
  color: string;
};

export async function createCourse(course: CourseInput): Promise<Course> {
  const { data, error } = await supabase
    .from("courses")
    .insert(course)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateCourse(
  id: string,
  updates: Partial<CourseInput>
): Promise<Course> {
  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
