import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [notes, setNotes] = useState(null);
  const [profiles, setProfile] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");

  async function fetchProfiles() {
    const response = await fetch("${process.env.REACT_APP_JSON_SERVER_URL}/profiles");
    const data = await response.json();

    setProfile(data.name);
  }

  async function fetchNotes() {
    const response = await fetch("${process.env.REACT_APP_JSON_SERVER_URL}/notes");
    const data = await response.json();

    setNotes(data);
  }

  const handleClickNote = (id) => {
    setCurrentIndex(id - 1);
  };

  const handleAddNote = async () => {
    const previousId = notes[notes.length - 1].id;
    const newNote = {
      id: previousId + 1,
      title: "Nouvelle note",
      content: "Nouvelle note",
      creation: new Date().toLocaleString(),
    };

    try {
      const response = await fetch("${process.env.REACT_APP_JSON_SERVER_URL}/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNote),
      });

      if (response.ok) {
        const updatedNotes = [...notes, newNote];
        setNotes(updatedNotes);
        setCurrentIndex(updatedNotes.length - 1);
        
        toast.success("Note ajoutée avec succès avec l'ID: " + newNote.id, {
          theme: "dark"
        })
      } else {
        console.log("erreure de requete");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la note :", error);
    }
  };

  const handleEditNote = () => {
    setIsEditing(true);
    setEditedContent(notes[currentIndex].content);
    setEditedTitle(notes[currentIndex].title);
  };

  const handleSaveNote = async () => {
    const updatedNotes = [...notes];
    updatedNotes[currentIndex].content = editedContent;
    updatedNotes[currentIndex].title = editedTitle;
    setNotes(updatedNotes);

    try {
      const response = await fetch(`${process.env.REACT_APP_JSON_SERVER_URL}/notes/${notes[currentIndex].id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedNotes[currentIndex]),
      });

      if (response.ok) {
        setIsEditing(false);
      } else {
        console.log("echec dans la requette");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la note :", error);
    }
  };

  const handleDeleteNote = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
      try {
        const response = await fetch(`${process.env.REACT_APP_JSON_SERVER_URL}/notes/${notes[currentIndex].id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const updatedNotes = [...notes];
          updatedNotes.splice(currentIndex, 1);
          updatedNotes.forEach((note, index) => {
            note.id = index + 1;
          });
          toast.success("La note à été supprimée avec succès", {
            theme: "dark"
          })

          setNotes(updatedNotes);

          if (updatedNotes.length > 0) {
            setCurrentIndex(0);
          } else {
            setCurrentIndex(null);
          }
          await fetch("/update-json", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedNotes),
          });
        } else {
          console.log("Échec de la requête de suppression");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la note :", error);
      }
    }
  };

  useEffect(function () {
    fetchNotes();
    fetchProfiles();
  }, []);

  if(!notes){
    return toast.success("Chargement en cours", {
      theme: "dark"
    })
  }

  return (
    <>
      <aside className="Side">
        <div className="TitrePage">NoteApp</div>
        <button className="AjoutNote" onClick={handleAddNote}>
          +
        </button>
        <div className="ProfileName">Welcome, {profiles}</div>

        {notes !== null
          ? notes.map((note, index) => (
              <div
                key={index}
                onClick={() => handleClickNote(note.id)}
                className={`Titles ${
                  currentIndex === index ? "NoteSelected" : ""
                }`}
              >
                {note.title}
                <div className="Creation">{note.creation}</div>
                <div className="Id">{note.id}</div>
              </div>
            ))
          : null}
      </aside>

      <main className="Main">
        <div>
          {notes !== null ? (
            <div className="NotesContentTitle">
              {isEditing ? (
                <textarea
                  className="EditableTextTitle"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              ) : (
                notes[currentIndex].title
              )}
            </div>
          ) : null}
        </div>
        <div>
          {notes !== null ? (
            <div className="NotesContent">
              {isEditing ? (
                <textarea
                  className="EditableTextArea"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                />
              ) : (
                notes[currentIndex].content
              )}
            </div>
          ) : null}

          {isEditing ? (
            <button className="SaveButton" onClick={handleSaveNote}>
              Enregistrer
            </button>
          ) : (
            <button className="SaveButton" onClick={handleEditNote}>
              Modifier
            </button>
          )}
          <button className="DelButton" onClick={handleDeleteNote}>
            Supprimer
          </button>
        </div>
      </main>

      <ToastContainer />
    </>
  );
}

export default App;
