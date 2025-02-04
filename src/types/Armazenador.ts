export class Armazenador {
    private constructor() { }

    static salvar(chave: string, valor: any): void {
        // Uma função em JavaScript usada para converter um valor JavaScript em uma string JSON
        const valorComoString = JSON.stringify(valor);
        localStorage.setItem(chave, valorComoString);
    }



    static obter<T>(chave: string, reviver?: (this: any, key: string, value: any) => any): T | null {
        const valor = localStorage.getItem(chave);

        if (valor === null) {
            return null;
        }

        if (reviver) {
        //Convertendo um array para string JSON            
            return JSON.parse(valor, reviver) 
        }
        return JSON.parse(valor);
    }
}
