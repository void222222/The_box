document.addEventListener('DOMContentLoaded', function () {
    // Elementos principais
    const marketplaceSelect = document.getElementById('marketplace');
    const precoInput = document.getElementById('preco');
    const custoInput = document.getElementById('custo');
    const freteInput = document.getElementById('frete');
    const customTaxesDiv = document.getElementById('custom-taxes');
    const taxaPercentInput = document.getElementById('taxaPercent');
    const taxaFixaInput = document.getElementById('taxaFixa');
    const taxaPagamentoInput = document.getElementById('taxaPagamento');
    const calculateBtn = document.getElementById('calculateBtn');

    // Elementos de resultado
    const receitaBrutaEl = document.getElementById('receitaBruta');
    const taxasMarketplaceEl = document.getElementById('taxasMarketplace');
    const taxaPagamentoValorEl = document.getElementById('taxaPagamentoValor');
    const custosTotaisEl = document.getElementById('custosTotais');
    const lucroLiquidoEl = document.getElementById('lucroLiquido');
    const margemEl = document.getElementById('margem');

    // Objeto com taxas pré-definidas dos marketplaces
    const marketplaces = {
        shopee: { percent: 10.0, fixed: 0.5, payment: 3.0 },
        mercadolivre: { percent: 14.0, fixed: 5.0, payment: 3.0 },
        magalu: { percent: 12.0, fixed: 3.0, payment: 3.0 },
        amazon: { percent: 15.0, fixed: 2.0, payment: 3.0 },
        custom: { percent: 0, fixed: 0, payment: 0 } // valores iniciais, serão sobrescritos pelo usuário
    };

    // Atualiza visibilidade das taxas customizadas conforme seleção
    function toggleCustomTaxes() {
        const selected = marketplaceSelect.value;
        if (selected === 'custom') {
            customTaxesDiv.style.display = 'block';
        } else {
            customTaxesDiv.style.display = 'none';
        }
        // Ao mudar, recalcula automaticamente (opcional)
        calculate();
    }

    marketplaceSelect.addEventListener('change', toggleCustomTaxes);

    // Função principal de cálculo
    function calculate() {
        // Obter valores
        let preco = parseFloat(precoInput.value) || 0;
        let custo = parseFloat(custoInput.value) || 0;
        let frete = parseFloat(freteInput.value) || 0;
        let selected = marketplaceSelect.value;

        // Taxas base
        let taxaPercent, taxaFixa, taxaPagamento;

        if (selected === 'custom') {
            taxaPercent = parseFloat(taxaPercentInput.value) || 0;
            taxaFixa = parseFloat(taxaFixaInput.value) || 0;
            taxaPagamento = parseFloat(taxaPagamentoInput.value) || 0;
        } else {
            const m = marketplaces[selected];
            taxaPercent = m.percent;
            taxaFixa = m.fixed;
            taxaPagamento = m.payment;
        }

        // Cálculos
        const taxasMarketplace = preco * (taxaPercent / 100) + taxaFixa;
        const taxaPagamentoValor = preco * (taxaPagamento / 100);
        const custosTotais = custo + frete;
        const lucro = preco - taxasMarketplace - taxaPagamentoValor - custosTotais;
        const margem = preco > 0 ? (lucro / preco) * 100 : 0;

        // Atualizar DOM com formatação
        receitaBrutaEl.textContent = `R$ ${preco.toFixed(2)}`;
        taxasMarketplaceEl.textContent = `R$ ${taxasMarketplace.toFixed(2)}`;
        taxaPagamentoValorEl.textContent = `R$ ${taxaPagamentoValor.toFixed(2)}`;
        custosTotaisEl.textContent = `R$ ${custosTotais.toFixed(2)}`;
        lucroLiquidoEl.textContent = `R$ ${lucro.toFixed(2)}`;
        margemEl.textContent = `${margem.toFixed(2)}%`;
    }

    // Atualiza quando qualquer input mudar
    const inputs = [
        precoInput, custoInput, freteInput, marketplaceSelect,
        taxaPercentInput, taxaFixaInput, taxaPagamentoInput
    ];
    inputs.forEach(input => input.addEventListener('input', calculate));
    inputs.forEach(input => input.addEventListener('change', calculate));

    // Botão calcular (também funciona, mas já temos input event)
    calculateBtn.addEventListener('click', calculate);

    // Inicializa
    toggleCustomTaxes();
    calculate();
});