const assert = require('assert');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function runTest() {
    // Configurar opções do Chrome, maximizando a janela
    const options = new chrome.Options();
    options.addArguments('start-maximized');

    // Inicializar o WebDriver usando o Selenium Builder
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    // Inicializar objeto para armazenar resultados do teste
    const testResults = {
        assertions: [],
        success: true,
    };

    try {
        // Abrir a página de login do GitHub
        await driver.get('https://github.com/login');

        // Preencher campos de login e senha
        await driver.findElement(By.id('login_field')).sendKeys('ajlima12');
        await driver.findElement(By.id('password')).sendKeys('anajulia-125', Key.RETURN);

        // Aguardar até que a página do GitHub seja carregada
        await driver.wait(until.titleIs('GitHub'), 15000);

        // Ir para o repositório desejado
        await driver.get('https://github.com/ajlima12/VegasExperience-Final');

        // Aguardar até que o título da página contenha o nome do repositório
        await driver.wait(until.titleContains('VegasExperience-Final'), 50000);

        console.log('Antes de esperar pelo elemento');

        // Tentar mudar para um possível iframe (ajustar o seletor conforme necessário)
        const iframeSelector = 'seletor-do-iframe';
        const iframeElements = await driver.findElements(By.css(iframeSelector));

        // Iterar sobre todos os iframes encontrados
        for (const iframeElement of iframeElements) {
            try {
                // Mudar para o iframe atual
                await driver.switchTo().frame(iframeElement);

                // Aguardar até que o elemento seja localizado ou até que o tempo limite seja atingido
                const element = await driver.wait(
                    until.elementLocated(By.css('strong a')),
                    60000,
                    'Elemento não encontrado dentro do tempo limite.'
                );

                console.log('Após esperar pelo elemento');

                // Obter o nome do repositório
                const repoName = await element.getText();

                // Pesquisar no Google pelo nome do repositório no contexto do iframe
                await driver.get('https://www.google.com');
                await driver.findElement(By.name('q')).sendKeys(`${repoName} site:github.com`, Key.RETURN);
                await driver.wait(until.titleContains(`${repoName} - Pesquisa Google`), 50000);

                const repoLinkSelector = `a[href*="${repoName}"][href*="github.com"]`;

                // Adicionar uma pequena espera antes de buscar o elemento
                await driver.sleep(3000); // Aguardar 3 segundos

                // Tentar localizar o elemento novamente após a espera
                const repoLink = await driver.findElement(By.css(repoLinkSelector));

                // Verificar se o link do repositório foi encontrado nos resultados do Google
                assert.ok(repoLink, 'O repositório não é compatível nos resultados do Google.');
                testResults.assertions.push('Assertion: O repositório é compatível nos resultados do Google.');

                // Sair do loop se o elemento for encontrado com sucesso
                break;
            } catch (error) {
                // Se não encontrar o elemento no iframe atual, continue para o próximo
                console.error('Erro no iframe:', error.message);
            } finally {
                // Mudar de volta para o contexto padrão
                await driver.switchTo().defaultContent();
            }
        }

    } catch (error) {
        // Lidar com erros durante a execução do teste
        console.error('Erro:', error.message);
        testResults.success = false;
        testResults.error = error.message;
    } finally {
        // Fechar o navegador ao finalizar o teste
        //await driver.quit();
    }

    // Exibir os resultados do teste no console
    console.log('\nResultados:');
    console.log(testResults);
}

// Chamar a função para executar o teste
runTest();
