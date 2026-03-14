const API_URL = "https://script.google.com/macros/s/AKfycbyDbZDp6RO0-Fjfa6Gk8OUQr4cTWLUC2aLT1eHVsuXgnaz2S2Oi6oRRa7TTgxjVlLVG/exec";

const app = {
    notes: [],
    currentFilter: 'Todas',
    editingId: null,

    async init() {
        try {
            const res = await fetch(API_URL);
            this.notes = await res.json();
            this.render();
        } catch (error) {
            console.error("Error cargando notas:", error);
        }
    },

    async saveNote() {
        const note = {
            id: this.editingId || Date.now().toString(),
            titulo: document.getElementById('noteTitle').value,
            contenido: document.getElementById('noteContent').value,
            categoria: document.getElementById('noteCategory').value,
            etiquetas: document.getElementById('noteTags').value,
            fijada: document.getElementById('notePinned').checked,
            esChecklist: document.getElementById('noteIsCheck').checked
        };

        const btn = document.querySelector('.modal-actions .btn-primary');
        btn.innerText = "Guardando...";

        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'save', note: note })
        });
        
        this.editingId = null;
        btn.innerText = "Guardar Cambios";
        ui.hideModal();
        this.init();
    },

    async deleteNote(id) {
        if(!confirm("¿Eliminar esta nota?")) return;
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'delete', id: id })
        });
        this.init();
    },

    // --- NUEVAS FUNCIONALIDADES ---
    
    exportPDF(id) {
        const n = this.notes.find(x => x.id == id);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text(n.titulo, 20, 20);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text(`Categoría: ${n.categoria} | Etiquetas: ${n.etiquetas}`, 20, 30);
        
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(n.contenido, 170);
        doc.text(splitText, 20, 45);

        doc.save(`${n.titulo.replace(/\s+/g, '_')}.pdf`);
    },

    sendEmail(id) {
        const n = this.notes.find(x => x.id == id);
        const subject = encodeURIComponent(`Nota: ${n.titulo}`);
        const body = encodeURIComponent(`Contenido de la nota (${n.categoria}):\n\n${n.contenido}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    },

    // --- LÓGICA DE RENDERIZADO ---

    filterByCategory(cat) {
        this.currentFilter = cat;
        document.querySelectorAll('#categories button').forEach(btn => {
            btn.classList.toggle('active', btn.innerText === cat);
        });
        cat === 'Todas' ? this.render(this.notes) : this.render(this.notes.filter(n => n.categoria === cat));
    },

    render(data = this.notes) {
        const grid = document.getElementById('notesGrid');
        grid.innerHTML = '';
        const sorted = [...data].sort((a, b) => b.fijada - a.fijada);
        
        sorted.forEach(n => {
            const card = document.createElement('div');
            card.className = `card ${n.fijada ? 'pinned' : ''}`;
            const tagsHTML = n.etiquetas ? n.etiquetas.split(',').map(t => `<span class="tag">#${t.trim()}</span>`).join('') : '';

            card.innerHTML = `
                <span class="card-cat">${n.categoria}</span>
                <h3>${n.titulo}</h3>
                <div class="content">${this.formatContent(n)}</div>
                <div class="tags">${tagsHTML}</div>
                <div class="card-tools">
                    <button onclick="app.exportPDF('${n.id}')" title="Exportar PDF">📄 PDF</button>
                    <button onclick="app.sendEmail('${n.id}')" title="Enviar por correo">📧 Correo</button>
                </div>
                <div class="card-actions">
                    <button onclick="ui.showModal('${n.id}')">Editar</button>
                    <button onclick="app.deleteNote('${n.id}')" style="color:#ef4444">Eliminar</button>
                </div>
            `;
            grid.appendChild(card);
        });
        document.getElementById('count').innerText = data.length;
    },

    formatContent(n) {
        if (n.esChecklist) {
            return n.contenido.split('\n').filter(l => l.trim() !== '').map(l => 
                `<div class="checklist-item"><input type="checkbox"> <span>${l}</span></div>`).join('');
        }
        return n.contenido.replace(/\n/g, '<br>');
    },

    search(query) {
        const q = query.toLowerCase();
        this.render(this.notes.filter(n => 
            n.titulo.toLowerCase().includes(q) || n.etiquetas.toLowerCase().includes(q)
        ));
    }
};

const ui = {
    showModal(id = null) {
        if(id) {
            const n = app.notes.find(x => x.id == id);
            app.editingId = id;
            document.getElementById('noteTitle').value = n.titulo;
            document.getElementById('noteContent').value = n.contenido;
            document.getElementById('noteCategory').value = n.categoria;
            document.getElementById('noteTags').value = n.etiquetas;
            document.getElementById('notePinned').checked = n.fijada;
            document.getElementById('noteIsCheck').checked = n.esChecklist;
        } else {
            app.editingId = null;
            this.clearInputs();
        }
        document.getElementById('noteModal').style.display = 'flex';
    },
    hideModal() {
        document.getElementById('noteModal').style.display = 'none';
        this.clearInputs();
    },
    clearInputs() {
        document.querySelectorAll('.modal input[type="text"], .modal textarea').forEach(i => i.value = '');
        document.querySelectorAll('.modal input[type="checkbox"]').forEach(i => i.checked = false);
    }
};

app.init();