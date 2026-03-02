document.addEventListener('DOMContentLoaded', function () {
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    const internationalCheck = document.getElementById('international');
    const cleanNumbersCheck = document.getElementById('cleanNumbers');
    const generateBtn = document.getElementById('generateBtn');
    const resultArea = document.getElementById('resultArea');
    const generatedLinkInput = document.getElementById('generatedLink');
    const copyBtn = document.getElementById('copyBtn');
    const previewText = document.getElementById('previewText');
    const testLink = document.getElementById('testLink');

    // QR Code elements
    const generateQrBtn = document.getElementById('generateQrBtn');
    const qrContainer = document.getElementById('qrContainer');
    const qrCanvas = document.getElementById('qrCanvas');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');

    // Variável para armazenar o link atual (útil para o PDF)
    let currentLink = '';

    function cleanNumber(rawNumber) {
        return rawNumber.replace(/\D/g, '');
    }

    function generateLink() {
        let phone = phoneInput.value.trim();
        let message = messageInput.value.trim();

        if (cleanNumbersCheck.checked) {
            phone = cleanNumber(phone);
        }

        message = message.replace(/^\s+|\s+$/g, '');

        if (!phone) {
            alert('Por favor, insira um número de telefone.');
            return;
        }

        let fullPhone = phone;
        if (internationalCheck.checked) {
            if (!fullPhone.startsWith('55')) {
                fullPhone = '55' + fullPhone;
            }
        }

        let url = `https://wa.me/${fullPhone}`;
        if (message) {
            url += `?text=${encodeURIComponent(message)}`;
        }

        currentLink = url;
        generatedLinkInput.value = url;
        previewText.textContent = message 
            ? `📱 ${fullPhone} | Mensagem: "${message}"`
            : `📱 ${fullPhone} (sem mensagem)`;
        testLink.href = url;
        resultArea.style.display = 'block';
        qrContainer.style.display = 'none';
        downloadPdfBtn.style.display = 'none'; // esconde PDF até gerar QR
    }

    generateBtn.addEventListener('click', generateLink);

    phoneInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            generateLink();
        }
    });

    messageInput.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateLink();
        }
    });

    copyBtn.addEventListener('click', function () {
        if (!generatedLinkInput.value) return;
        generatedLinkInput.select();
        navigator.clipboard.writeText(generatedLinkInput.value)
            .then(() => {
                const original = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                setTimeout(() => copyBtn.innerHTML = original, 2000);
            })
            .catch(() => alert('Erro ao copiar. Selecione manualmente.'));
    });

    function generateQRCode() {
        if (!currentLink) return;

        const ctx = qrCanvas.getContext('2d');
        ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);

        const qr = qrcode(0, 'H');
        qr.addData(currentLink);
        qr.make();

        const cellSize = 8;
        const size = qr.getModuleCount() * cellSize;
        qrCanvas.width = size;
        qrCanvas.height = size;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#000000';
        for (let row = 0; row < qr.getModuleCount(); row++) {
            for (let col = 0; col < qr.getModuleCount(); col++) {
                if (qr.isDark(row, col)) {
                    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                }
            }
        }
        qrContainer.style.display = 'block';
        downloadPdfBtn.style.display = 'inline-flex'; // mostra botão PDF
    }

    generateQrBtn.addEventListener('click', generateQRCode);

    function downloadPDF() {
        if (!currentLink) return;

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Título
        pdf.setFontSize(20);
        pdf.setTextColor(37, 211, 102); // verde WhatsApp
        pdf.text('thebox - WhatsApp Link', 105, 20, { align: 'center' });

        // Linha separadora
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, 25, 190, 25);

        // QR Code (imagem do canvas)
        const canvas = qrCanvas;
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 75, 35, 60, 60);

        // Link abaixo do QR
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Link:', 20, 110);
        pdf.text(currentLink, 20, 120);

        // Número e mensagem extraídos do previewText
        const preview = previewText.innerText;
        if (preview) {
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            // Divide em linhas para não ultrapassar a largura
            const splitPreview = pdf.splitTextToSize(preview, 170);
            pdf.text(splitPreview, 20, 135);
        }

        // Rodapé
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Gerado por thebox', 105, 280, { align: 'center' });

        pdf.save('whatsapp-link-qr.pdf');
    }

    downloadPdfBtn.addEventListener('click', downloadPDF);

    resultArea.style.display = 'none';
});