
import { Armazenador } from "./Armazenador.js";
import { ValidaDebito, ValidaDeposito } from "./Decorators.js";
import { GrupoTransacao } from "./transacao/GrupoTransacao.js";
import { TipoTransacao } from "./transacao/TipoTransacao.js";
import { Transacao } from "./transacao/Transacao.js";

export class Conta {
    protected nome: string;
    protected saldo: number = Armazenador.obter<number>("saldo") || 0;
    
    // Corrigido: verifica se o valor recuperado é uma array
    private transacoes: Transacao[] = (() => {
      const transacoesSalvas = Armazenador.obter("transacoes");
      return Array.isArray(transacoesSalvas) ? transacoesSalvas : [];
    })();
  
    constructor(nome: string) {
      this.nome = nome;
    }
  
    public getTitular() {
      return this.nome;
    }
  
    getGruposTransacoes(): GrupoTransacao[] {
      const gruposTransacoes: GrupoTransacao[] = [];
      const listaTransacoes: Transacao[] = structuredClone(this.transacoes);
      const transacoesOrdenadas: Transacao[] = listaTransacoes.sort((t1, t2) => t2.data.getTime() - t1.data.getTime());
      let labelAtualGrupoTransacao: string = "";
  
      for (let transacao of transacoesOrdenadas) {
        let labelGrupoTransacao: string = transacao.data.toLocaleDateString("pt-br", { month: "long", year: "numeric" });
        if (labelAtualGrupoTransacao !== labelGrupoTransacao) {
          labelAtualGrupoTransacao = labelGrupoTransacao;
          gruposTransacoes.push({
            label: labelGrupoTransacao,
            transacoes: []
          });
        }
        gruposTransacoes.at(-1).transacoes.push(transacao);
      }
  
      return gruposTransacoes;
    }
  
    getSaldo() {
      return this.saldo;
    }
  
    getDataAcesso(): Date {
      return new Date();
    }
  
    registrarTransacao(novaTransacao: Transacao): void {
      if (novaTransacao.tipoTransacao === TipoTransacao.DEPOSITO) {
        this.depositar(novaTransacao.valor);
      } else if (
        novaTransacao.tipoTransacao === TipoTransacao.TRANSFERENCIA ||
        novaTransacao.tipoTransacao === TipoTransacao.PAGAMENTO_BOLETO
      ) {
        this.debitar(novaTransacao.valor);
        novaTransacao.valor *= -1;
      } else {
        throw new Error("Tipo de Transação é inválido!");
      }
  
      this.transacoes.push(novaTransacao);
      console.log(this.getGruposTransacoes());
      Armazenador.salvar("transacoes", JSON.stringify(this.transacoes));
    }
  
    @ValidaDebito
    debitar(valor: number): void {
      this.saldo -= valor;
      Armazenador.salvar("saldo", this.saldo.toString());
    }

    @ValidaDeposito
    depositar(valor: number): void {
        this.saldo = (this.saldo || 0) + valor;  // Garanta que está somando como número
        Armazenador.salvar("saldo", this.saldo.toString());
    }

    
    //@ValidaDeposito
    //depositar(valor: number): void {
    //  this.saldo += valor;
    //  Armazenador.salvar("saldo", this.saldo.toString());
   // }

  }

  export class ContaPremium extends Conta {
    registrarTransacao(transacao: Transacao): void {
        if (transacao.tipoTransacao === TipoTransacao.DEPOSITO) {
                    console.log("ganhou um bônus de 0.50 centavos");
                    transacao.valor += 0.5
        }
        super.registrarTransacao(transacao)
    }
  }
  
  // código omitido
  
  
  const conta = new Conta("Gerson Aparecido Lima");
  const contaPremium = new ContaPremium("Mônica Hillman");
  
  console.log(conta.getTitular())
  
  
  export default conta;