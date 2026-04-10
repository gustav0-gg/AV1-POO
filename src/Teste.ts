import TipoTeste from "./enum/TipoTeste";
import ResultadoTeste from "./enum/ResultadoTeste";

export default class Teste{
    tipo: TipoTeste
    resultado: ResultadoTeste

    constructor(tipo: TipoTeste, resultado: ResultadoTeste){
        this.tipo = tipo
        this.resultado = resultado
    }

    salvar(): object{
        return{
            tipo: this.tipo,
            resultado: this.resultado
        }
    }

    static carregar(dados: any): Teste {
        return new Teste(dados.tipo, dados.resultado);
    }
}

