// data-manager.js - Gerenciamento de dados (CRUD, relatórios)
document.addEventListener('DOMContentLoaded', function() {
  const db = firebase.firestore();
  const auth = firebase.auth();

  // Utilitário para mostrar spinner de loading
  function showLoading(container, msg = 'Carregando...') {
    let spinner = container.querySelector('.loading-spinner');
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.className = 'loading-spinner active';
      spinner.setAttribute('aria-live', 'polite');
      spinner.innerHTML = msg;
      container.appendChild(spinner);
    }
    spinner.style.display = 'flex';
  }
  function hideLoading(container) {
    const spinner = container.querySelector('.loading-spinner');
    if (spinner) spinner.style.display = 'none';
  }

  // Função para atualizar tabelas com Firestore
  function updateTable(tableId, collection, fields, editHandler, deleteHandler) {
    console.log('50. Atualizando tabela:', tableId, 'Coleção:', collection);
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) {
      console.log('51. Tabela não encontrada:', tableId);
      return;
    }
    tbody.innerHTML = '';
    showLoading(tbody, 'Carregando...');
    db.collection(collection).get().then(querySnapshot => {
      tbody.innerHTML = '';
      querySnapshot.forEach(doc => {
        const item = { id: doc.id, ...doc.data() };
        const row = document.createElement('tr');
        fields.forEach(field => {
          const cell = document.createElement('td');
          cell.textContent = item[field] || '';
          row.appendChild(cell);
        });
        const actionsCell = document.createElement('td');
        actionsCell.className = 'action-buttons';
        actionsCell.innerHTML = `
          <button class="edit-btn" data-id="${item.id}" aria-label="Editar"><i class="fas fa-edit"></i></button>
          <button class="delete-btn" data-id="${item.id}" aria-label="Excluir"><i class="fas fa-trash"></i></button>
        `;
        row.appendChild(actionsCell);
        tbody.appendChild(row);
      });

      tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          editHandler(btn.dataset.id);
        });
      });
      tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          deleteHandler(btn.dataset.id);
        });
      });
      hideLoading(tbody);
    }).catch(error => {
      console.error('55. Erro ao carregar dados para tabela:', error.code, error.message);
      tbody.innerHTML = `<tr><td colspan="${fields.length + 1}" aria-live="assertive" style="color:#d32f2f;">Erro ao carregar dados. Tente novamente.</td></tr>`;
      hideLoading(tbody);
    });
  }

  // Gerenciar Alunos (usado em secretaria/alunos.html)
  const alunoForm = document.getElementById('aluno-form');
  if (alunoForm) {
    let submitLock = false;
    alunoForm.addEventListener('input', () => {
      // Oculta erro ao digitar (se houver campo de erro)
      const errorMessage = document.getElementById('aluno-error-message');
      if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        errorMessage.removeAttribute('aria-live');
        errorMessage.removeAttribute('tabindex');
      }
    });
    // ...existing code...
    alunoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (submitLock) return;
      submitLock = true;
      // ...existing code...
      const nome = document.getElementById('aluno-nome').value.trim();
      const matricula = document.getElementById('aluno-matricula').value.trim();
      const curso = document.getElementById('aluno-curso').value;
      const errorMessage = document.getElementById('aluno-error-message');
      if (!nome || !matricula || !curso) {
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, preencha todos os campos.';
          errorMessage.style.display = 'block';
          errorMessage.setAttribute('aria-live', 'assertive');
          errorMessage.setAttribute('tabindex', '-1');
          errorMessage.focus();
        } else {
          alert('Por favor, preencha todos os campos.');
        }
        submitLock = false;
        return;
      }
      // ...existing code...
      if (alunoForm.dataset.editId) {
        // ...existing code...
        db.collection('alunos').doc(id).update({ nome, matricula, curso })
          .then(() => {
            updateTable('alunos-table', 'alunos', ['nome', 'matricula', 'curso']);
            alunoForm.reset();
            delete alunoForm.dataset.editId;
          })
          .catch(error => {
            if (errorMessage) {
              errorMessage.textContent = 'Erro ao editar aluno: ' + error.message;
              errorMessage.style.display = 'block';
              errorMessage.setAttribute('aria-live', 'assertive');
              errorMessage.setAttribute('tabindex', '-1');
              errorMessage.focus();
            } else {
              alert('Erro ao editar aluno: ' + error.message);
            }
          })
          .finally(() => { submitLock = false; });
      } else {
        // ...existing code...
        db.collection('alunos').add({ nome, matricula, curso })
          .then(docRef => {
            db.collection('alunos').doc(docRef.id).update({ id: docRef.id });
            updateTable('alunos-table', 'alunos', ['nome', 'matricula', 'curso']);
            alunoForm.reset();
          })
          .catch(error => {
            if (errorMessage) {
              errorMessage.textContent = 'Erro ao adicionar aluno: ' + error.message;
              errorMessage.style.display = 'block';
              errorMessage.setAttribute('aria-live', 'assertive');
              errorMessage.setAttribute('tabindex', '-1');
              errorMessage.focus();
            } else {
              alert('Erro ao adicionar aluno: ' + error.message);
            }
          })
          .finally(() => { submitLock = false; });
      }
    });
  }

  // Gerenciar Professores (usado em admin/usuarios.html para professores)
  const professorForm = document.getElementById('professor-form');
  if (professorForm) {
    let submitLock = false;
    professorForm.addEventListener('input', () => {
      const errorMessage = document.getElementById('professor-error-message');
      if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        errorMessage.removeAttribute('aria-live');
        errorMessage.removeAttribute('tabindex');
      }
    });
    // ...existing code...
    professorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (submitLock) return;
      submitLock = true;
      // ...existing code...
      const nome = document.getElementById('professor-nome').value.trim();
      const email = document.getElementById('professor-email').value.trim();
      const disciplina = document.getElementById('professor-disciplina').value.trim();
      const errorMessage = document.getElementById('professor-error-message');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!nome || !email || !disciplina) {
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, preencha todos os campos.';
          errorMessage.style.display = 'block';
          errorMessage.setAttribute('aria-live', 'assertive');
          errorMessage.setAttribute('tabindex', '-1');
          errorMessage.focus();
        } else {
          alert('Por favor, preencha todos os campos.');
        }
        submitLock = false;
        return;
      }
      if (!emailRegex.test(email)) {
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, insira um email válido.';
          errorMessage.style.display = 'block';
          errorMessage.setAttribute('aria-live', 'assertive');
          errorMessage.setAttribute('tabindex', '-1');
          errorMessage.focus();
        } else {
          alert('Por favor, insira um email válido.');
        }
        submitLock = false;
        return;
      }
      // ...existing code...
      if (professorForm.dataset.editId) {
        // ...existing code...
        db.collection('usuarios').doc(id).update({ nome, email, disciplina, role: 'professor' })
          .then(() => {
            updateTable('professores-table', 'usuarios', ['nome', 'email', 'disciplina']);
            professorForm.reset();
            delete professorForm.dataset.editId;
          })
          .catch(error => {
            if (errorMessage) {
              errorMessage.textContent = 'Erro ao editar professor: ' + error.message;
              errorMessage.style.display = 'block';
              errorMessage.setAttribute('aria-live', 'assertive');
              errorMessage.setAttribute('tabindex', '-1');
              errorMessage.focus();
            } else {
              alert('Erro ao editar professor: ' + error.message);
            }
          })
          .finally(() => { submitLock = false; });
      } else {
        // ...existing code...
        db.collection('usuarios').add({ nome, email, disciplina, role: 'professor' })
          .then(docRef => {
            db.collection('usuarios').doc(docRef.id).update({ id: docRef.id });
            updateTable('professores-table', 'usuarios', ['nome', 'email', 'disciplina']);
            professorForm.reset();
          })
          .catch(error => {
            if (errorMessage) {
              errorMessage.textContent = 'Erro ao adicionar professor: ' + error.message;
              errorMessage.style.display = 'block';
              errorMessage.setAttribute('aria-live', 'assertive');
              errorMessage.setAttribute('tabindex', '-1');
              errorMessage.focus();
            } else {
              alert('Erro ao adicionar professor: ' + error.message);
            }
          })
          .finally(() => { submitLock = false; });
      }
    });
  }

  // Gerenciar Cursos (usado em admin/cursos.html)
  const cursoForm = document.getElementById('curso-form');
  if (cursoForm) {
    let submitLock = false;
    cursoForm.addEventListener('input', () => {
      const errorMessage = document.getElementById('curso-error-message');
      if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        errorMessage.removeAttribute('aria-live');
        errorMessage.removeAttribute('tabindex');
      }
    });
    // ...existing code...
    cursoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (submitLock) return;
      submitLock = true;
      // ...existing code...
      const cursoNomeInput = document.getElementById('curso-nome');
      const cursoDuracaoInput = document.getElementById('curso-duracao');
      const errorMessage = document.getElementById('curso-error-message');
      if (!cursoNomeInput || !cursoDuracaoInput) {
        if (errorMessage) {
          errorMessage.textContent = 'Erro: Formulário de curso incompleto. Verifique os campos.';
          errorMessage.style.display = 'block';
          errorMessage.setAttribute('aria-live', 'assertive');
          errorMessage.setAttribute('tabindex', '-1');
          errorMessage.focus();
        } else {
          alert('Erro: Formulário de curso incompleto. Verifique os campos.');
        }
        submitLock = false;
        return;
      }
      const nome = cursoNomeInput.value.trim();
      const duracao = cursoDuracaoInput.value.trim();
      if (!nome || !duracao) {
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, preencha todos os campos.';
          errorMessage.style.display = 'block';
          errorMessage.setAttribute('aria-live', 'assertive');
          errorMessage.setAttribute('tabindex', '-1');
          errorMessage.focus();
        } else {
          alert('Por favor, preencha todos os campos.');
        }
        submitLock = false;
        return;
      }
      if (isNaN(duracao) || parseInt(duracao) <= 0) {
        if (errorMessage) {
          errorMessage.textContent = 'Por favor, insira uma duração válida (número positivo).';
          errorMessage.style.display = 'block';
          errorMessage.setAttribute('aria-live', 'assertive');
          errorMessage.setAttribute('tabindex', '-1');
          errorMessage.focus();
        } else {
          alert('Por favor, insira uma duração válida (número positivo).');
        }
        submitLock = false;
        return;
      }
      // ...existing code...
      if (cursoForm.dataset.editId) {
        // ...existing code...
        db.collection('cursos').doc(id).update({ nome, duracao: parseInt(duracao) })
          .then(() => {
            updateTable('cursos-table', 'cursos', ['nome', 'duracao']);
            cursoForm.reset();
            delete cursoForm.dataset.editId;
            alert('Curso atualizado com sucesso!');
          })
          .catch(error => {
            if (errorMessage) {
              errorMessage.textContent = 'Erro ao editar curso: ' + error.message;
              errorMessage.style.display = 'block';
              errorMessage.setAttribute('aria-live', 'assertive');
              errorMessage.setAttribute('tabindex', '-1');
              errorMessage.focus();
            } else {
              alert('Erro ao editar curso: ' + error.message);
            }
          })
          .finally(() => { submitLock = false; });
      } else {
        // ...existing code...
        db.collection('cursos').add({ nome, duracao: parseInt(duracao) })
          .then(docRef => {
            db.collection('cursos').doc(docRef.id).update({ id: docRef.id });
            updateTable('cursos-table', 'cursos', ['nome', 'duracao']);
            cursoForm.reset();
            alert('Curso adicionado com sucesso!');
          })
          .catch(error => {
            if (errorMessage) {
              errorMessage.textContent = 'Erro ao adicionar curso: ' + error.message;
              errorMessage.style.display = 'block';
              errorMessage.setAttribute('aria-live', 'assertive');
              errorMessage.setAttribute('tabindex', '-1');
              errorMessage.focus();
            } else {
              alert('Erro ao adicionar curso: ' + error.message);
            }
          })
          .finally(() => { submitLock = false; });
      }
    });
  }

  // Gerenciar Relatórios (usado em admin/relatorios.html ou secretaria/relatorios.html)
  const relatorioForm = document.getElementById('relatorio-form');
  if (relatorioForm) {
    let submitLock = false;
    relatorioForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (submitLock) return;
      submitLock = true;
      const tipo = document.getElementById('relatorio-tipo').value;
      const output = document.getElementById('relatorio-output');
      output.innerHTML = '';
      let collection, fields;
      if (tipo === 'alunos') {
        collection = 'alunos';
        fields = ['nome', 'matricula', 'curso'];
      } else if (tipo === 'professores') {
        collection = 'usuarios';
        fields = ['nome', 'email', 'disciplina'];
      } else if (tipo === 'cursos') {
        collection = 'cursos';
        fields = ['nome', 'duracao'];
      } else {
        output.innerHTML = '<p aria-live="assertive" style="color:#d32f2f;">Por favor, selecione um tipo de relatório.</p>';
        submitLock = false;
        return;
      }
      output.innerHTML = `<h3>Relatório de ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h3>`;
      showLoading(output, 'Carregando relatório...');
      const table = document.createElement('table');
      table.className = 'admin-table';
      const thead = document.createElement('thead');
      const tbody = document.createElement('tbody');
      thead.innerHTML = `<tr>${fields.map(f => `<th>${f.charAt(0).toUpperCase() + f.slice(1)}</th>`).join('')}</tr>`;
      db.collection(collection).get().then(querySnapshot => {
        const data = [];
        querySnapshot.forEach(doc => {
          const item = { id: doc.id, ...doc.data() };
          data.push(item);
          const row = document.createElement('tr');
          fields.forEach(field => {
            const cell = document.createElement('td');
            cell.textContent = item[field] || '';
            row.appendChild(cell);
          });
          tbody.appendChild(row);
        });
        table.appendChild(thead);
        table.appendChild(tbody);
        output.appendChild(table);

        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'Exportar como CSV';
        exportBtn.style.padding = '10px 20px';
        exportBtn.style.backgroundColor = '#3498db';
        exportBtn.style.color = '#ffffff';
        exportBtn.style.border = 'none';
        exportBtn.style.borderRadius = '8px';
        exportBtn.style.marginTop = '16px';
        exportBtn.style.cursor = 'pointer';
        exportBtn.addEventListener('click', () => {
          exportToCSV(data, fields, `relatorio_${tipo}.csv`);
        });
        output.insertAdjacentElement('afterend', exportBtn);
        hideLoading(output);
      }).catch(error => {
        output.innerHTML = `<p aria-live="assertive" style="color:#d32f2f;">Erro ao gerar relatório: ${error.message}</p>`;
        hideLoading(output);
      }).finally(() => { submitLock = false; });
    });
  }

  // Exportar relatórios como CSV
  function exportToCSV(data, fields, filename) {
    const csv = ['\ufeff' + fields.join(','), ...data.map(item => fields.map(f => `"${item[f] || ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
});
