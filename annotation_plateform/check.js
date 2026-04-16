let currentChunk = null;
let currentData = null;
let currentIndex = -1;
let editingImplicitIndex = -1;
let editingUrlIndex = -1;

// Get chunk ID from URL
const urlParams = new URLSearchParams(window.location.search);
const chunkId = urlParams.get('chunk');

if (!chunkId) {
    alert('未指定 Chunk ID，将返回首页');
    window.location.href = 'index.html';
}

document.getElementById('chunkIdDisplay').textContent = chunkId;

// Load chunk data
document.addEventListener('DOMContentLoaded', function() {
    loadChunkData();
});

async function loadChunkData() {
    try {
        const response = await fetch(`data/chunk_${chunkId}.json`);
        currentChunk = await response.json();
        
        // Populate data selector
        const dataSelect = document.getElementById('dataSelect');
        dataSelect.innerHTML = '<option value="">请选择...</option>';
        
        currentChunk.forEach((item, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${index + 1}. ${item.name || 'Unnamed'}`;
            dataSelect.appendChild(option);
        });
        
        document.getElementById('dataCounter').textContent = `共 ${currentChunk.length} 条数据`;
        
        // Load from localStorage if exists
        const savedData = localStorage.getItem(`chunk_${chunkId}_data`);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (Array.isArray(parsed) && parsed.length === currentChunk.length) {
                    currentChunk = parsed;
                    console.log('已加载本地保存的数据');
                }
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    } catch (error) {
        console.error('Error loading chunk data:', error);
        alert('加载数据失败，请检查数据文件是否存在。');
    }
}

function loadDataItem() {
    const select = document.getElementById('dataSelect');
    const index = parseInt(select.value);
    
    if (isNaN(index) || index < 0 || index >= currentChunk.length) {
        document.getElementById('dataEditor').style.display = 'none';
        return;
    }
    
    currentIndex = index;
    currentData = currentChunk[index];
    
    // 确保数据结构存在
    if (!currentData) {
        alert('数据项不存在');
        return;
    }
    
    // Populate fields
    document.getElementById('instructionField').value = currentData.instruction || '';
    document.getElementById('nameField').value = currentData.name || '';
    
    // Initial Requirements - 处理空字符串
    const initialReq = currentData.initial_requirements || '';
    document.getElementById('initialReqField').value = initialReq;
    
    // Load URL stories
    loadUrlStories();
    
    // Load implicit requirements
    loadImplicitRequirements();
    
    document.getElementById('dataEditor').style.display = 'block';
}

function loadUrlStories() {
    const tbody = document.getElementById('urlTableBody');
    tbody.innerHTML = '';
    
    // 确保 URL 存在且为数组
    if (!currentData.URL) {
        currentData.URL = [];
    }
    
    const urlStories = Array.isArray(currentData.URL) 
        ? currentData.URL 
        : [];
    
    if (urlStories.length === 0) {
        // 显示空状态提示
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="2" style="text-align: center; color: #999; padding: 20px;">
                当前没有用户故事，点击下方按钮添加
            </td>
        `;
        tbody.appendChild(row);
        return;
    }
    
    urlStories.forEach((story, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="cell-content">${escapeHtml(story || '')}</td>
            <td>
                <button class="btn btn-edit" onclick="editUrlStory(${index})">编辑</button>
                <button class="btn btn-danger" onclick="deleteUrlStory(${index})">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function addUrlStory() {
    editingUrlIndex = -1;
    document.getElementById('modalUrlStory').value = '';
    document.getElementById('urlEditModal').style.display = 'block';
}

function editUrlStory(index) {
    editingUrlIndex = index;
    const story = currentData.URL[index];
    document.getElementById('modalUrlStory').value = story || '';
    document.getElementById('urlEditModal').style.display = 'block';
}

function saveUrlStory() {
    const story = document.getElementById('modalUrlStory').value.trim();
    
    if (!story) {
        alert('用户故事不能为空');
        return;
    }
    
    // 确保 URL 是数组
    if (!Array.isArray(currentData.URL)) {
        currentData.URL = [];
    }
    
    if (editingUrlIndex >= 0) {
        // Edit existing
        currentData.URL[editingUrlIndex] = story;
    } else {
        // Add new
        currentData.URL.push(story);
    }
    
    currentChunk[currentIndex] = currentData;
    loadUrlStories();
    closeUrlEditModal();
}

function deleteUrlStory(index) {
    if (confirm('确定要删除这条用户故事吗？')) {
        currentData.URL.splice(index, 1);
        currentChunk[currentIndex] = currentData;
        loadUrlStories();
    }
}

function closeUrlEditModal() {
    document.getElementById('urlEditModal').style.display = 'none';
    editingUrlIndex = -1;
}

function loadImplicitRequirements() {
    const tbody = document.getElementById('implicitTableBody');
    tbody.innerHTML = '';
    
    // 确保 Implicit Requirements 存在且为数组
    if (!currentData['Implicit Requirements']) {
        currentData['Implicit Requirements'] = [];
    }
    
    const implicitReqs = Array.isArray(currentData['Implicit Requirements']) 
        ? currentData['Implicit Requirements'] 
        : [];
    
    if (implicitReqs.length === 0) {
        // 显示空状态提示
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" style="text-align: center; color: #999; padding: 20px;">
                当前没有隐式需求，点击下方按钮添加
            </td>
        `;
        tbody.appendChild(row);
        return;
    }
    
    implicitReqs.forEach((req, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="cell-content">${escapeHtml(req.Aspect || '')}</td>
            <td class="cell-content">${escapeHtml(req.RequirementText || '')}</td>
            <td class="cell-content">${escapeHtml(req['Corresponding User Story'] || '')}</td>
            <td>
                <button class="btn btn-edit" onclick="editImplicitRequirement(${index})">编辑</button>
                <button class="btn btn-danger" onclick="deleteImplicitRequirement(${index})">删除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function handleAspectChange() {
    const select = document.getElementById('modalAspect');
    const customInput = document.getElementById('modalAspectCustom');
    
    if (select.value === '__custom__') {
        customInput.style.display = 'block';
        customInput.value = '';
        customInput.focus();
    } else {
        customInput.style.display = 'none';
        customInput.value = '';
    }
}

function addImplicitRequirement() {
    editingImplicitIndex = -1;
    document.getElementById('modalAspect').value = '';
    document.getElementById('modalAspectCustom').value = '';
    document.getElementById('modalAspectCustom').style.display = 'none';
    document.getElementById('modalRequirementText').value = '';
    document.getElementById('modalCorrespondingStory').value = '';
    document.getElementById('editModal').style.display = 'block';
}

function editImplicitRequirement(index) {
    editingImplicitIndex = index;
    const req = currentData['Implicit Requirements'][index];
    const aspect = req.Aspect || '';
    
    // 检查 Aspect 是否在预设选项中
    const presetAspects = ['Interaction', 'Content', 'Style'];
    const aspectSelect = document.getElementById('modalAspect');
    const aspectCustom = document.getElementById('modalAspectCustom');
    
    if (presetAspects.includes(aspect)) {
        aspectSelect.value = aspect;
        aspectCustom.style.display = 'none';
        aspectCustom.value = '';
    } else if (aspect) {
        // 自定义值
        aspectSelect.value = '__custom__';
        aspectCustom.style.display = 'block';
        aspectCustom.value = aspect;
    } else {
        aspectSelect.value = '';
        aspectCustom.style.display = 'none';
        aspectCustom.value = '';
    }
    
    document.getElementById('modalRequirementText').value = req.RequirementText || '';
    document.getElementById('modalCorrespondingStory').value = req['Corresponding User Story'] || '';
    document.getElementById('editModal').style.display = 'block';
}

function saveImplicitRequirement() {
    const aspectSelect = document.getElementById('modalAspect');
    const aspectCustom = document.getElementById('modalAspectCustom');
    const requirementText = document.getElementById('modalRequirementText').value.trim();
    const correspondingStory = document.getElementById('modalCorrespondingStory').value.trim();
    
    if (!requirementText) {
        alert('Requirement Text 不能为空');
        return;
    }
    
    // 获取 Aspect 值
    let aspect = '';
    if (aspectSelect.value === '__custom__') {
        aspect = aspectCustom.value.trim();
        if (!aspect) {
            alert('请输入自定义 Aspect 值');
            return;
        }
    } else if (aspectSelect.value) {
        aspect = aspectSelect.value;
    }
    
    const newReq = {
        Aspect: aspect,
        RequirementText: requirementText,
        'Corresponding User Story': correspondingStory
    };
    
    if (!currentData['Implicit Requirements']) {
        currentData['Implicit Requirements'] = [];
    }
    
    if (editingImplicitIndex >= 0) {
        // Edit existing
        currentData['Implicit Requirements'][editingImplicitIndex] = newReq;
    } else {
        // Add new
        currentData['Implicit Requirements'].push(newReq);
    }
    
    currentChunk[currentIndex] = currentData;
    loadImplicitRequirements();
    closeEditModal();
}

function deleteImplicitRequirement(index) {
    if (confirm('确定要删除这条隐式需求吗？')) {
        currentData['Implicit Requirements'].splice(index, 1);
        currentChunk[currentIndex] = currentData;
        loadImplicitRequirements();
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingImplicitIndex = -1;
    // 重置表单
    document.getElementById('modalAspect').value = '';
    document.getElementById('modalAspectCustom').value = '';
    document.getElementById('modalAspectCustom').style.display = 'none';
}

function saveCurrentItem() {
    if (currentIndex < 0) {
        alert('请先选择一条数据');
        return;
    }
    
    // Update instruction/name/initial requirements
    currentData.instruction = document.getElementById('instructionField').value.trim();
    currentData.name = document.getElementById('nameField').value.trim();
    
    // Initial Requirements - 保存为空字符串（如果为空）
    const initialReqValue = document.getElementById('initialReqField').value.trim();
    currentData.initial_requirements = initialReqValue || '';
    
    // 确保 URL 是数组（已经在表格中管理，这里只是确保格式）
    if (!Array.isArray(currentData.URL)) {
        currentData.URL = [];
    }
    
    // 确保 Implicit Requirements 是数组
    if (!Array.isArray(currentData['Implicit Requirements'])) {
        currentData['Implicit Requirements'] = [];
    }
    
    // Update current chunk
    currentChunk[currentIndex] = currentData;
    
    // Save to localStorage
    localStorage.setItem(`chunk_${chunkId}_data`, JSON.stringify(currentChunk));
    
    alert('数据已保存到本地存储！');
}

function resetCurrentItem() {
    if (confirm('确定要重置当前数据吗？未保存的修改将丢失。')) {
        loadDataItem();
    }
}

function exportChunk() {
    if (!currentChunk) {
        alert('没有可导出的数据');
        return;
    }
    
    // Get data from localStorage if exists
    const savedData = localStorage.getItem(`chunk_${chunkId}_data`);
    const dataToExport = savedData ? JSON.parse(savedData) : currentChunk;
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chunk_${chunkId}_exported.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const editModal = document.getElementById('editModal');
    const urlEditModal = document.getElementById('urlEditModal');
    if (event.target === editModal) {
        closeEditModal();
    }
    if (event.target === urlEditModal) {
        closeUrlEditModal();
    }
}

