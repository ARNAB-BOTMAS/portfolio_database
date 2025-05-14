let currentType = '';
let currentFormFields = [];
let currentEditingId = null;
let isEditMode = false;
let currentProfile = {};


if (localStorage.getItem("isLogin") !== "true") {
    window.location.replace("/login");
}

window.onload = async () => {
    try {
        const res = await fetch('/profile');
        const profiles = await res.json();
        const profile = profiles[0];
        currentProfile = profile;
        const container = document.getElementById('profile');
        container.innerHTML = `
            <img src="${profile.profile_picture}" alt="Profile Picture" class="profile-img">
            <img src="${profile.about_me_picture}" alt="Profile Picture" class="profile-img">
            <div class="profile-text">
                <h2>${profile.name}</h2>
                <p><strong>Position:</strong> ${profile.position}</p>
                <p><strong>Email:</strong> ${profile.email}</p>
                <p><strong>Address:</strong> ${profile.address}</p>
                <p><strong>About Me:</strong> ${profile.about_me}</p>
                <a href="${profile.resume_link}" target="_blank">Download Resume</a>
                <button class="edit-btn" onclick="openProfileModal()">✏️ Edit Profile</button>
                <button class="edit-btn" onclick="logOut()">🚪 Logout</button>
            </div>
        `;
    } catch (err) {
        console.error(err);
        document.getElementById('profile').innerText = "Failed to load profile.";
    }
};

function logOut() {
    localStorage.setItem("isLogin", "false");
    window.location.replace("/login");
}


function openProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.style.display = 'block';
    const form = document.getElementById('profileForm');
    for (let key in currentProfile) {
        if (form[key]) {
            form[key].value = currentProfile[key];
        }
    }
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

document.getElementById('profileForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = {};
    const form = e.target;
    ['name', 'position', 'email', 'address', 'about_me', 'resume_link', 'profile_picture', 'about_me_picture'].forEach(field => {
        formData[field] = form[field].value;
    });

    try {
        const res = await fetch(`/edit/profile/${currentProfile.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            alert("Profile updated successfully.");
            closeProfileModal();
            window.onload(); // reload profile
        } else {
            alert("Failed to update profile.");
        }
    } catch (err) {
        console.error(err);
        alert("Error updating profile.");
    }
});

async function loadSection(type) {
    const allSections = ['skills', 'education', 'projects', 'experience', 'social'];
    allSections.forEach(id => {
        document.getElementById(id).style.display = 'none';
        document.getElementById(id).innerHTML = '';
    });

    const section = document.getElementById(type);
    section.style.display = 'block';
    section.innerHTML = `<h2>Loading ${capitalize(type)}...</h2>`;

    try {
        const res = await fetch(`/${type}`);
        const data = await res.json();

        if (!data.length) {
            section.innerHTML = `<h2>${capitalize(type)}</h2><p>No data found.</p>`;
        } else {
            data.sort((a, b) => a.id - b.id);

            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            const headers = getHeaders(type);
            headers.push('Actions');
            const headerRow = document.createElement('tr');
            headers.forEach(h => {
                const th = document.createElement('th');
                th.textContent = h;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);

            data.forEach(item => {
                const row = document.createElement('tr');
                const cells = getRowData(type, item);
                cells.forEach(cell => {
                    const td = document.createElement('td');
                    td.innerHTML = cell;
                    row.appendChild(td);
                });

                const actionTd = document.createElement('td');
                actionTd.innerHTML = `
                    <button onclick='editItem("${type}", ${JSON.stringify(item).replace(/'/g, "\\'")})'>✏️</button>
                    <button onclick='deleteItem("${type}", "${item.id}")'>🗑️</button>
                `;
                row.appendChild(actionTd);
                tbody.appendChild(row);
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            section.innerHTML = `<h2>${capitalize(type)}</h2>`;
            section.appendChild(table);
        }

        const btn = document.createElement('button');
        btn.className = 'add-btn';
        btn.textContent = `➕ Add ${capitalize(type)}`;
        btn.onclick = () => openModal(type);
        section.appendChild(btn);

    } catch (err) {
        console.error(err);
        section.innerHTML = `<p>Failed to load ${type}.</p>`;
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getHeaders(type) {
    switch (type) {
        case 'skills': return ['Skill Name', 'Logo'];
        case 'education': return ['Establishment', 'Course', 'Start Year', 'End Year', 'Organization', 'Status', 'Picture'];
        case 'projects': return ['Title', 'Description', 'Background', 'Link'];
        case 'experience': return ['Company', 'Position', 'Joining Year', 'Status', 'Company Logo'];
        case 'social': return ['Platform', 'Icon', 'URL'];
        default: return [];
    }
}

function getRowData(type, item) {
    switch (type) {
        case 'skills':
            return [item.skill_name, `<img src="${item.skill_logo}" alt="" width="50">`];
        case 'education':
            return [item.establishment_name, item.course_name, item.start_year, item.end_year, item.organization_name, item.status, `<img src="${item.establishment_picture}" alt="" width="50">`];
        case 'projects':
            return [item.project_title, item.project_description, `<img src="${item.background}" alt="" width="50">`, `<a href="${item.project_link}" target="_blank">View</a>`];
        case 'experience':
            return [item.company_name, item.position, item.joining_year, item.status, `<img src="${item.company_logo}" alt="" width="50">`];
        case 'social':
            return [item.media_name, `<ion-icon name="${item.media_logo}"></ion-icon>`, `<a href="${item.media_link}" target="_blank">Visit</a>`];
        default:
            return [];
    }
}

function getFormFields(type) {
    switch (type) {
        case 'skills': return ['skill_name', 'skill_logo'];
        case 'education': return ['establishment_name', 'course_name', 'start_year', 'end_year', 'organization_name', 'status', 'establishment_picture'];
        case 'projects': return ['project_title', 'project_description', 'background', 'project_link'];
        case 'experience': return ['company_name', 'position', 'joining_year', 'status', 'company_logo'];
        case 'social': return ['media_name', 'media_logo', 'media_link'];
        default: return [];
    }
}

function openModal(type) {
    currentType = type;
    isEditMode = false;
    currentEditingId = null;

    const modal = document.getElementById('addModal');
    modal.style.display = 'block';
    document.getElementById('modalTitle').innerText = `Add ${capitalize(type)}`;
    const formFields = document.getElementById('formFields');
    formFields.innerHTML = '';

    currentFormFields = getFormFields(type);
    currentFormFields.forEach(field => {
        formFields.innerHTML += `<input type="text" class="form-input" name="${field}" placeholder="${capitalize(field)}" required>`;
    });
}

function editItem(type, item) {
    openModal(type);
    isEditMode = true;
    currentEditingId = item.id;
    document.getElementById('modalTitle').innerText = `Edit ${capitalize(type)}`;

    currentFormFields.forEach(field => {
        const input = document.querySelector(`[name="${field}"]`);
        input.value = item[field] || '';
    });
}

async function deleteItem(type, id) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
        const res = await fetch(`/delete/${type}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert(`${capitalize(type)} deleted successfully.`);
            loadSection(type);
        } else {
            alert(`Failed to delete ${type}.`);
        }
    } catch (err) {
        console.error(err);
        alert("Error deleting data.");
    }
}

document.querySelector('.close').onclick = () => {
    document.getElementById('addModal').style.display = 'none';
    isEditMode = false;
    currentEditingId = null;
};

window.onclick = function (event) {
    const addModal = document.getElementById('addModal');
    const profileModal = document.getElementById('profileModal');
    if (event.target == addModal) {
        addModal.style.display = 'none';
        isEditMode = false;
        currentEditingId = null;
    }
    if (event.target == profileModal) {
        closeProfileModal();
    }
};

document.getElementById('addForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = {};
    currentFormFields.forEach(field => {
        formData[field] = e.target[field].value;
    });

    const url = isEditMode ? `/edit/${currentType}/${currentEditingId}` : `/add/${currentType}`;
    const method = isEditMode ? 'PUT' : 'POST';
    console.log(JSON.stringify(formData));

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            alert(`${capitalize(currentType)} ${isEditMode ? 'updated' : 'added'} successfully.`);
            document.getElementById('addModal').style.display = 'none';
            loadSection(currentType);
        } else {
            alert(`Failed to ${isEditMode ? 'update' : 'add'} ${currentType}.`);
        }
    } catch (err) {
        console.error(err);
        alert('Error submitting form.');
    } finally {
        isEditMode = false;
        currentEditingId = null;
    }
});
