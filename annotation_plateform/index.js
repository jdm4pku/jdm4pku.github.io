// Load chunks index and display chunk cards
document.addEventListener('DOMContentLoaded', function() {
    loadChunks();
});

async function loadChunks() {
    try {
        const response = await fetch('data/chunks_index.json');
        const chunks = await response.json();
        
        const chunkGrid = document.getElementById('chunkGrid');
        chunkGrid.innerHTML = '';
        
        chunks.forEach(chunk => {
            const card = document.createElement('a');
            card.href = `check.html?chunk=${chunk.chunk_id}`;
            card.className = 'chunk-card';
            card.innerHTML = `
                <h2>Chunk ${chunk.chunk_id}</h2>
                <p><strong>数据条数:</strong> ${chunk.count}</p>
                <p><strong>索引范围:</strong> ${chunk.start_index} - ${chunk.end_index}</p>
            `;
            chunkGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading chunks:', error);
        document.getElementById('chunkGrid').innerHTML = 
            '<p style="color: red;">加载 chunks 失败，请检查数据文件是否存在。</p>';
    }
}

