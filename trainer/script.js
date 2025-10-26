// Função para rolagem suave
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Função para assinar plano
function assinarPlano(price) {
    const urlPagamento = `pagamento.html`;
    window.location.href = urlPagamento;
}


// Função para calcular IMC
function calcularIMC() {
    const peso = parseFloat(document.getElementById('peso').value);
    const altura = parseFloat(document.getElementById('altura').value);
    
    if (isNaN(peso) || isNaN(altura) || altura === 0) {
        alert('Por favor, insira valores válidos para peso e altura.');
        return;
    }
    
    const imc = (peso / (altura * altura)).toFixed(2);
    const resultado = document.getElementById('resultado');
    
    let classificacao = '';
    if (imc < 18.5) {
        classificacao = 'Abaixo do peso';
    } else if (imc < 24.9) {
        classificacao = 'Peso normal';
    } else if (imc < 29.9) {
        classificacao = 'Sobrepeso';
    } else if (imc < 34.9) {
        classificacao = 'Obesidade Grau I';
    } else if (imc < 39.9) {
        classificacao = 'Obesidade Grau II';
    } else {
        classificacao = 'Obesidade Grau III';
    }
    
    resultado.textContent = `Seu IMC é ${imc} (${classificacao})`;
}



