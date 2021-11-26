import { drawSegment } from "./Utils.js";
import { Funnel } from "./Funnel.js";

class SupportingChain{
    /**
     * 
     * @param {*} index if -1, we consider the chair to be the first point
     * @param {*} zoo 
     * @param {*} zoo_reshaped 
     */
    constructor(index, zoo, zoo_reshaped){
        this.index = index
        this.zoo = zoo 
        this.poly = zoo_reshaped
        this.C_i = index === -1 ? this.zoo.chair : zoo.cages[index]
        this.after = this.getCageAfter() // C_i+1
        this.chain = this.getSupportingChains(index)
        //this.contact_points = this.getContactPoint()
        this.getContactPoint()
    }
    /**
     * Computes and return the two supporting chain of cage C_i, respectively 
     * the chain between C_{i-1} and C_i , and
     * the chain between C_i and C_{i+1}. 
     * 
     * C_O == C_k == chair 
     *
     */
    getSupportingChains(){
        let after_chain = new Funnel(this.poly)
        let chair = this.zoo.chair
        after_chain.addPoint(this.C_i === chair ? chair : this.C_i.getStartPoint())
        after_chain.addPoint(this.after === chair ? this.zoo.chair : this.after.getEndPoint())
        after_chain.funnel()
        let supporting_chain = after_chain.path

        return supporting_chain
    }

    getCageAfter() {
        let cages = this.zoo.cages
        if (this.index === 0){
            if (cages.length > this.index+1) return cages[this.index+1]; else this.zoo.chair 
        } else if (this.index === cages.length-1){
            return this.zoo.chair
        } else{
            return cages[this.index+1]
        }
    }

    getContactPoint() {
         
        if (this.index !== -1){
            for (let i=1; i< this.chain.length; i++){
            
                if (!this.C_i.points.includes(this.chain[i])) {
                    this.C_i.B = this.chain[i-1]
                    this.C_i.B.label = "b" // last point leaving C_i
                    break
                }
            }
        }
        if(this.index !== this.zoo.cages.length-1 ){
            for (let i=0; i< this.chain.length; i++){
                if (this.after.points.includes(this.chain[i])) {
                    this.after.A = this.chain[i]
                    this.after.A.label = "a" // first point touching C_i+1
                    break
                }
            }
        }
    }

    draw(){
        for (let i=0; i<this.chain.length-1; i++){
            drawSegment(this.chain[i], this.chain[i+1], "purple")
        }
    }

}
export {SupportingChain}


