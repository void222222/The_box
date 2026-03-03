document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const barcodeValue = document.getElementById('barcodeValue');
    const formatSelect = document.getElementById('format');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const fontSizeInput = document.getElementById('fontSize');
    const colorInput = document.getElementById('color');
    const bgColorInput = document.getElementById('bgColor');
    const showTextCheck = document.getElementById('showText');
    const quietZoneCheck = document.getElementById('quietZone');
    const generateBtn = document.getElementById('generateBtn');
    const barcodeSvg = document.getElementById('barcodeSvg');
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const downloadSvgBtn = document.getElementById('downloadSvgBtn');
    const copyImageBtn = document.getElementById('copyImageBtn');
    const charLimitMsg = document.getElementById('charLimitMsg'); // Elemento para mensagem (precisa ser criado no HTML)

    // Limites de caracteres para cada formato
    const charLimits = {
        EAN13: 13,
        EAN8: 8,
        UPC: 12,
        CODE128: null, // sem limite fixo
        CODE39: null,  // sem limite fixo
        ITF14: 14
    };

    // Exemplos válidos
    const examples = {
        EAN13: '5901234123457',
        EAN8: '59012341',
        UPC: '123456789012',
        CODE128: 'ABC-123',
        CODE39: 'CODE39',
        ITF14: '12345678901234'
    };

    // Atualiza placeholder e valor com exemplo
    function updateExample() {
        const format = formatSelect.value;
        const example = examples[format] || '7891234567890';
        barcodeValue.placeholder = `Ex.: ${example}`;
        if (!barcodeValue.value.trim()) {
            barcodeValue.value = example;
        }
        checkLengthLimit(); // verifica limite ao trocar formato
        generateBarcode();
    }

    // Verifica se o valor atual respeita o limite de caracteres
    function checkLengthLimit() {
        const format = formatSelect.value;
        const limit = charLimits[format];
        const value = barcodeValue.value.trim();
        if (limit && value.length > limit) {
            charLimitMsg.textContent = `Máximo permitido: ${limit} caracteres.`;
            charLimitMsg.style.display = 'block';
            barcodeValue.classList.add('error');
        } else {
            charLimitMsg.style.display = 'none';
            barcodeValue.classList.remove('error');
        }
    }

    // Gera o código de barras
    function generateBarcode() {
        const value = barcodeValue.value.trim();
        if (!value) {
            barcodeSvg.innerHTML = '';
            barcodeSvg.classList.remove('invalid');
            return;
        }

        // Verifica limite antes de gerar
        checkLengthLimit();

        const options = {
            format: formatSelect.value,
            width: parseFloat(widthInput.value) || 2,
            height: parseFloat(heightInput.value) || 80,
            displayValue: showTextCheck.checked,
            fontSize: parseFloat(fontSizeInput.value) || 16,
            lineColor: colorInput.value,
            background: bgColorInput.value,
            margin: quietZoneCheck.checked ? 10 : 0,
            valid: function(valid) {
                if (valid) {
                    barcodeSvg.classList.remove('invalid');
                } else {
                    barcodeSvg.classList.add('invalid');
                }
            }
        };

        try {
            JsBarcode(barcodeSvg, value, options);
        } catch (e) {
            console.error('Erro ao gerar código:', e);
            barcodeSvg.innerHTML = '';
            barcodeSvg.classList.add('invalid');
        }
    }

    // Listeners
    formatSelect.addEventListener('change', updateExample);
    updateExample();

    generateBtn.addEventListener('click', generateBarcode);

    const inputs = [
        barcodeValue, formatSelect, widthInput, heightInput,
        fontSizeInput, colorInput, bgColorInput, showTextCheck, quietZoneCheck
    ];
    inputs.forEach(input => input.addEventListener('input', function() {
        checkLengthLimit();
        generateBarcode();
    }));

    // Download SVG (igual)
    function downloadSvg() {
        const svg = barcodeSvg;
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svg);
        if (!source.match(/<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        const blob = new Blob([source], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'barcode.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    downloadSvgBtn.addEventListener('click', downloadSvg);

    function downloadPng() {
        const svg = barcodeSvg;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const data = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        const svgBlob = new Blob([data], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = bgColorInput.value;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            const pngUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = 'barcode.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        img.src = url;
    }
    downloadPngBtn.addEventListener('click', downloadPng);

    function copyImage() {
        const svg = barcodeSvg;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const data = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        const svgBlob = new Blob([data], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = bgColorInput.value;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            canvas.toBlob(function (blob) {
                if (!blob) return;
                navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]).then(() => {
                    alert('Imagem copiada para a área de transferência!');
                }).catch(() => {
                    alert('Não foi possível copiar. Tente baixar a imagem.');
                });
            });
        };
        img.src = url;
    }
    copyImageBtn.addEventListener('click', copyImage);
});