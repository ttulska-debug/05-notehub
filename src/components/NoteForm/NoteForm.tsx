import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  type FormikHelpers,
} from "formik";

import * as Yup from "yup";

import type {
  CreateNotePayload,
} from "../../services/noteService";

import type { NoteTag } from "../../types/note";

import css from "./NoteForm.module.css";

interface NoteFormProps {
  onCancel: () => void;
  onSubmit: (
    values: CreateNotePayload
  ) => Promise<unknown>;
}

const tags: NoteTag[] = [
  "Todo",
  "Work",
  "Personal",
  "Meeting",
  "Shopping",
];

const validationSchema = Yup.object({
  title: Yup.string()
    .min(3, "At least 3 characters")
    .max(50, "Maximum 50 characters")
    .required("Title is required"),

  content: Yup.string()
    .max(500, "Maximum 500 characters"),

  tag: Yup.mixed<NoteTag>()
    .oneOf(tags, "Choose a valid tag")
    .required("Tag is required"),
});

const initialValues: CreateNotePayload = {
  title: "",
  content: "",
  tag: "Todo",
};

export default function NoteForm({
  onCancel,
  onSubmit,
}: NoteFormProps) {
  const handleSubmit = async (
    values: CreateNotePayload,
    helpers: FormikHelpers<CreateNotePayload>
  ): Promise<void> => {
    try {
      await onSubmit(values);
      helpers.resetForm();
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className={css.form}>
          <div className={css.formGroup}>
            <label htmlFor="title">
              Title
            </label>

            <Field
              id="title"
              type="text"
              name="title"
              className={css.input}
            />

            <ErrorMessage
              name="title"
              component="span"
              className={css.error}
            />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">
              Content
            </label>

            <Field
              as="textarea"
              id="content"
              name="content"
              rows={8}
              className={css.textarea}
            />

            <ErrorMessage
              name="content"
              component="span"
              className={css.error}
            />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">
              Tag
            </label>

            <Field
              as="select"
              id="tag"
              name="tag"
              className={css.select}
            >
              {tags.map((tag) => (
                <option value={tag} key={tag}>
                  {tag}
                </option>
              ))}
            </Field>

            <ErrorMessage
              name="tag"
              component="span"
              className={css.error}
            />
          </div>

          <div className={css.actions}>
            <button
              type="button"
              className={css.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={css.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating..."
                : "Create note"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}