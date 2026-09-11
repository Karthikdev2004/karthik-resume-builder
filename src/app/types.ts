export type Education = {
  school: string;
  degree: string;
  year: string;
  gpa?: string;
  location?: string;
  description?: string;
  id: string;
};

export type Experience = {
  company: string;
  role: string;
  duration: string;
  location?: string;
  description: string;
  id: string;
};

export type Project = {
  name: string;
  description: string;
  link?: string;
  duration?: string;
  techStack?: string; // Technologies/frameworks used in the project
  id: string;
};

export type Certificate = {
  title: string;
  issuer: string;
  date: string;
  description?: string;
  id: string;
};

export type Achievement = {
  title: string;
  issuer: string;
  date: string;
  description?: string;
  id: string;
};

import { TemplateId } from "./templates";

export type ResumeData = {
  jdText: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    website: string;
    location?: string;
    title?: string;
  };
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certificate[];
  achievements: Achievement[];
  skills: string;
  template?: TemplateId;
  latexCode?: string;
};
