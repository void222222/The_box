(function() {
    // Elementos DOM
    const card = document.getElementById('card');
    const uploadArea = document.getElementById('uploadArea');
    const videoFileInput = document.getElementById('videoFile');
    const videoWrapper = document.getElementById('videoWrapper');
    const video = document.getElementById('videoPreview');
    const timelineContainer = document.getElementById('timelineContainer');
    const timelineBar = document.getElementById('timelineBar');
    const playhead = document.getElementById('playhead');
    const timelineFill = document.getElementById('timelineFill');
    const markerStart = document.getElementById('markerStart');
    const markerEnd = document.getElementById('markerEnd');
    const startLabel = document.getElementById('startLabel');
    const endLabel = document.getElementById('endLabel');
    const startValue = document.getElementById('startValue');
    const endValue = document.getElementById('endValue');
    const durationValue = document.getElementById('durationValue');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const processBtn = document.getElementById('processBtn');
    const progressArea = document.getElementById('progressArea');
    const progressFill = document.getElementById('progressFill');
    const statusDiv = document.getElementById('status');
    const downloadLink = document.getElementById('downloadLink');
    const errorContainer = document.getElementById('errorContainer');

    // Variáveis de estado
    let currentFile = null;
    let videoDuration = 0;
    let startPercent = 0;
    let endPercent = 100;
    let dragging = null;
    let ffmpeg = null;

    // Efeito de brilho
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--x', e.clientX - rect.left + 'px');
        card.style.setProperty('--y', e.clientY - rect.top + 'px');
    });

    // Upload
    uploadArea.addEventListener('click', () => videoFileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ef4444';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'rgba(255,255,255,0.1)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(255,255,255,0.1)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) handleVideo(file);
        else alert('Por favor, selecione um arquivo de vídeo válido.');
    });

    videoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleVideo(file);
    });

    function handleVideo(file) {
        currentFile = file;
        const url = URL.createObjectURL(file);
        video.src = url;
        videoWrapper.style.display = 'block';
        timelineContainer.style.display = 'block';
        downloadLink.style.display = 'none';
        progressArea.style.display = 'none';
        errorContainer.style.display = 'none';
        
        video.onloadedmetadata = () => {
            videoDuration = video.duration;
            durationSpan.textContent = formatTime(videoDuration);
            endPercent = 100;
            updateMarkers();
        };
    }

    // Atualizar agulha e fill enquanto o vídeo toca
    video.addEventListener('timeupdate', () => {
        if (!videoDuration) return;
        const percent = (video.currentTime / videoDuration) * 100;
        playhead.style.left = percent + '%';
        timelineFill.style.width = percent + '%';
        currentTimeSpan.textContent = formatTime(video.currentTime);
    });

    // Clique na timeline para mover o vídeo
    timelineBar.addEventListener('click', (e) => {
        if (!videoDuration) return;
        const rect = timelineBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = (clickX / rect.width) * 100;
        const time = (percent / 100) * videoDuration;
        video.currentTime = time;
    });

    // Arrastar marcadores
    markerStart.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        dragging = 'start';
    });

    markerEnd.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        dragging = 'end';
    });

    document.addEventListener('mousemove', (e) => {
        if (!dragging || !videoDuration) return;
        const rect = timelineBar.getBoundingClientRect();
        let x = e.clientX - rect.left;
        if (x < 0) x = 0;
        if (x > rect.width) x = rect.width;
        const percent = (x / rect.width) * 100;

        if (dragging === 'start') {
            if (percent < endPercent) {
                startPercent = percent;
            } else {
                startPercent = endPercent - 1;
            }
        } else if (dragging === 'end') {
            if (percent > startPercent) {
                endPercent = percent;
            } else {
                endPercent = startPercent + 1;
            }
        }
        updateMarkers();
    });

    document.addEventListener('mouseup', () => {
        dragging = null;
    });

    function updateMarkers() {
        markerStart.style.left = startPercent + '%';
        markerEnd.style.left = endPercent + '%';

        const startTime = (startPercent / 100) * videoDuration;
        const endTime = (endPercent / 100) * videoDuration;
        const dur = endTime - startTime;

        startLabel.textContent = formatTime(startTime);
        endLabel.textContent = formatTime(endTime);
        startValue.textContent = startTime.toFixed(1) + 's';
        endValue.textContent = endTime.toFixed(1) + 's';
        durationValue.textContent = dur.toFixed(1) + 's';
    }

    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        return `${m}:${s.toString().padStart(2,'0')}`;
    }

    // Processar corte
    processBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        const startTime = (startPercent / 100) * videoDuration;
        const endTime = (endPercent / 100) * videoDuration;
        const duration = endTime - startTime;

        if (duration <= 0) {
            alert('Selecione um trecho válido (início menor que fim).');
            return;
        }

        processBtn.disabled = true;
        progressArea.style.display = 'block';
        statusDiv.innerText = 'Preparando FFmpeg...';
        errorContainer.style.display = 'none';

        try {
            if (!window.crossOriginIsolated) {
                throw new Error('Headers COOP/COEP não ativos.');
            }

            if (!ffmpeg) {
                if (typeof FFmpegWASM === 'undefined') {
                    throw new Error('FFmpeg não carregou. Verifique o script.');
                }
                
                ffmpeg = new FFmpegWASM.FFmpeg();
                
                ffmpeg.on('log', ({ message }) => {
                    console.log('FFmpeg log:', message);
                });
                
                ffmpeg.on('progress', ({ progress }) => {
                    const percent = Math.round(progress * 100);
                    progressFill.style.width = percent + '%';
                    statusDiv.innerText = `Processando... ${percent}%`;
                });

                statusDiv.innerText = 'Carregando FFmpeg...';
                
                // Usar versão multi-thread com arquivos locais
                await ffmpeg.load({
                    coreURL: '/ffmpeg/ffmpeg-core.js',
                    wasmURL: '/ffmpeg/ffmpeg-core.wasm',
                    workerURL: '/ffmpeg/ffmpeg-core.worker.js'
                });
            }

            statusDiv.innerText = 'Processando vídeo...';

            const inputFileName = 'input' + getExtension(currentFile.name);
            const fileData = await fetchFile(currentFile);
            await ffmpeg.writeFile(inputFileName, fileData);

            await ffmpeg.exec([
                '-i', inputFileName,
                '-ss', startTime.toString(),
                '-t', duration.toString(),
                '-c', 'copy',
                'output.mp4'
            ]);

            statusDiv.innerText = 'Finalizando...';

            const data = await ffmpeg.readFile('output.mp4');
            const blob = new Blob([data.buffer], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);

            downloadLink.href = url;
            downloadLink.download = `cortado_${currentFile.name.replace(/\.[^/.]+$/, '')}.mp4`;
            downloadLink.style.display = 'flex';
            statusDiv.innerText = 'Pronto! Clique no botão acima para baixar.';

            await ffmpeg.deleteFile(inputFileName);
            await ffmpeg.deleteFile('output.mp4');

        } catch (error) {
            console.error('Erro:', error);
            errorContainer.style.display = 'block';
            errorContainer.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <strong>Erro:</strong> ${error.message}`;
            statusDiv.innerText = 'Falha no processamento.';
        } finally {
            processBtn.disabled = false;
        }
    });

    function getExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    async function fetchFile(file) {
        return new Uint8Array(await file.arrayBuffer());
    }
})();