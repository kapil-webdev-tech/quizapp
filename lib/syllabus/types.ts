export type Exam = {
  id: string;
  nameEn: string;
  nameHi: string | null;
  slug: string;
  descriptionEn: string | null;
  descriptionHi: string | null;
  createdAt: string;
};

export type Subject = {
  id: string;
  nameEn: string;
  nameHi: string | null;
  slug: string;
  descriptionEn: string | null;
  descriptionHi: string | null;
  createdAt: string;
};

export type Topic = {
  id: string;
  nameEn: string;
  nameHi: string | null;
  slug: string;
  descriptionEn: string | null;
  descriptionHi: string | null;
  createdAt: string;
};

export type ExamSubject = {
  examId: string;
  subjectId: string;
};

export type SubjectTopic = {
  subjectId: string;
  topicId: string;
};

export type TopicRelation = {
  parentTopicId: string;
  childTopicId: string;
  relationType: string;
};