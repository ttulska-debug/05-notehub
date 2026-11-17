import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useDebouncedCallback } from "use-debounce";

import {
  createNote,
  deleteNote,
  fetchNotes,
  type CreateNotePayload,
} from "../../services/noteService";

import NoteList from "../NoteList/NoteList";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import Pagination from "../Pagination/Pagination";
import SearchBox from "../SearchBox/SearchBox";

import css from "./App.module.css";

const PER_PAGE = 12;

export default function App() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateSearch = useDebouncedCallback(
    (value: string) => {
      setSearch(value);
      setPage(1);
    },
    400
  );

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["notes", page, search],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: PER_PAGE,
        search,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateNotePayload) =>
      createNote(payload),

    onSuccess: async () => {
      setIsModalOpen(false);
      setPage(1);

      await queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notes"],
      });

      // Перевіряємо, чи не спорожніла поточна сторінка.
      const updatedData = await queryClient.fetchQuery({
        queryKey: ["notes", page, search],
        queryFn: () =>
          fetchNotes({
            page,
            perPage: PER_PAGE,
            search,
          }),
      });

      if (
        updatedData.notes.length === 0 &&
        page > 1
      ) {
        setPage((currentPage) => currentPage - 1);
      }
    },
  });

  return (
    <main className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onSearch={updateSearch} />

        {data && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}

        <button
          className={css.button}
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          Create note +
        </button>
      </header>

      {isPending && (
        <p className={css.message}>
          Loading notes...
        </p>
      )}

      {isError && (
        <p className={css.error}>
          Could not load notes: {error.message}
        </p>
      )}

      {!isPending &&
        !isError &&
        data?.notes.length === 0 && (
          <p className={css.message}>
            No notes found. Create your first note!
          </p>
        )}

      {!!data?.notes.length && (
        <NoteList
          notes={data.notes}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      )}

      {deleteMutation.isError && (
        <p className={css.error}>
          Could not delete the note.
        </p>
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm
            onCancel={() => setIsModalOpen(false)}
            onSubmit={(payload) =>
              createMutation.mutateAsync(payload)
            }
          />

          {createMutation.isError && (
            <p className={css.error}>
              Could not create the note.
            </p>
          )}
        </Modal>
      )}
    </main>
  );
}