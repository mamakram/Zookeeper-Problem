import { drawSegment } from "./Utils.js";
import { Funnel } from "./Funnel.js";

class SupportingChain{
    constructor(index, zoo, zoo_reshaped){
        this.zoo = zoo 
        this.poly = zoo_reshaped
        this.C_i = zoo.cages[index]
        this.index = index
        this.chains = this.getSupportingChains(index)
    }
    /**
     * Computes and return the two supporting chain of cage C_i, respectively 
     * the chain between C_{i-1} and C_i , and
     * the chain between C_i and C_{i+1}. 
     * 
     * C_O == C_k == chair 
     *
     */
    getSupportingChains(index){
        let previous ;          // the cage before C_i
        let after ;             // the cage after C_i

        let cages = this.zoo.cages
        if (index === 0){
            previous = this.zoo.chair
            after = cages.length > index+1 ? cages[index+1] : this.zoo.chair 
        } else if (index === cages.length-1){
            previous = index-1 >= 0 ? cages[index-1] : this.zoo.chair
            after = this.zoo.chair
        } else{
            previous = cages[index-1]
            after = cages[index+1]
        }

        let supporting_chains = []

        let prev_chain = new Funnel(this.poly)
        prev_chain.addPoint(this.C_i.getStartPoint())
        prev_chain.addPoint(after === this.zoo.chair ? this.zoo.chair : after.getEndPoint())
        prev_chain.funnel()
        supporting_chains.push(prev_chain.path)

        let after_chain = new Funnel(this.poly)
        after_chain.addPoint(previous === this.zoo.chair ? this.zoo.chair : previous.getStartPoint())
        after_chain.addPoint(this.C_i.getEndPoint())
        after_chain.funnel()
        supporting_chains.push(after_chain.path)
        
        return supporting_chains
    }

    draw(){
        let colors = ["purple", "orange"]
        for (let i=0; i< 2;i++){
            for (let j=0; j<this.chains[i].length-1; j++){
                drawSegment(this.chains[i][j], this.chains[i][j+1], colors[i])
            }
        }
    }

}
export {SupportingChain}


