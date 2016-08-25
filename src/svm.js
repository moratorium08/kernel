// this svm is only for 2 dimensional data.
const eps = 0.001;
const MAX_ITERATION = 1000000;
class SVM {
	// data structure:
	// data = [ [x11, x12], [x21, x22] ... ]
	// target = [t1, t2, t3, ... ]
	constructor (data, target, regularization = 1.0) { 
		this.data = data;
		this.target = target;
		this.index = 0;
		this.bias = 0;
		this.regularization = regularization;
		this.lagrangeMultipliers 
			= Array.apply(null, new Array(this.data.length))
					.map(() => (0));
	}

	// gaussian kernel
	kernel( x1, x2, sigma = 1.0) {
		return Math.exp(- (Math.pow((x1[0] - x2[0]),2) + Math.pow((x1[1] - x2[1]),2)) 
				/ 2 / Math.pow(sigma, 2));
	}

	// data structure:
	// data = [x1, x2] (2-dimentional)
	presume(data) {
		if (data.length!=2)
			throw new Error("given data is not 2 dimentional");
		return  this.data.reduce( (prev, curr, idx) => (
			prev + this.lagrangeMultipliers[idx] * this.target[idx] * 
						this.kernel(data, curr)), 0) - this.bias;
	}

	_getIllegalValue(examineAll) {
		const first = this.index;
		const regularize = (x) => {
			if (x >= this.data.length) return x - this.data.length;
			return x;
		}
		for (let i = 0; i<this.data.length; i++){
			if (!examineAll && Math.abs(this.lagrangeMultipliers[i]) < eps 
					&& Math.abs(this.lagrangeMultipliers[i]-this.regularization) < eps) continue;
			this.index = regularize(i+first);
			const y2 = this.target[this.index];
			const alph2 = this.lagrangeMultipliers[this.index];
			const E2 = this.presume(this.data[this.index]) - y2;
			const r2 = E2*y2;
			const C = this.regularization;
			if ((r2 < -eps && alph2 < C) || (r2 > eps && alph2 > 0)){
				return this.index++;
			} 

		}
		return -1;
	}

	_update(i1, i2) {
		let L, H;
		const a1 = this.lagrangeMultipliers[i1];
		const a2 = this.lagrangeMultipliers[i2];

		if (this.target[i1] != this.target[i2]) {
			L = Math.max(0, a2 - a1)
			H = Math.min(this.regularization, this.regularization +a2 - a1);
		} else {
			L = Math.max(0, a1 + a2 - this.regularization);
			H = Math.min(this.regularization, a1 + a2);
		}

		const d1 = this.data[i1];
		const d2 = this.data[i2];
		const t1 = this.target[i1];
		const t2 = this.target[i2];
		const E1 = this.presume(d1) - t1
		const E2 = this.presume(d2) - t2;
		const a2_new_unclipped = (a2 + t2 * (E1 - E2)) /
			(this.kernel(d1, d1) - 2 * this.kernel(d1, d2) + this.kernel(d2, d2));
		let a2_new = a2_new_unclipped;
		if (a2_new_unclipped > H) a2_new = H;
		else if(a2_new_unclipped < L) a2_new = L;
		if (a2_new < 1e-8) a2_new = 0;
		if (a2_new > this.regularization - 1e-8) a2_new = this.regularization;
		const a1_new = a1 + t1*t2*(a2 - a2_new);

		this.lagrangeMultipliers[i1] = a1_new;
		this.lagrangeMultipliers[i2] = a2_new;
		// update bias parameter (12.9),(12,10)式
		const b1_new = E1 + t1 * (a1_new - a1) * this.kernel(d1, d1) 
					+ t2 * (a2_new_unclipped - a2) * this.kernel(d1,d2) + this.bias;
		const b2_new = E2 + t1 * (a1_new - a1) * this.kernel(d1, d2) 
					+ t2 * (a2_new_unclipped - a2) * this.kernel(d2,d2) + this.bias;

		if (0 < a1_new && a1_new<this.regularization) this.bias = b1_new;
		else if ( 0 < a2_new && a2_new < this.regularization) this.bias = b2_new;
		else this.bias = (b1_new + b2_new) / 2; 
	}

	learn(){
		let iteration = 0;
		let examineAll = false;
		while (1){
			if (iteration++ > MAX_ITERATION) {
				console.log("Over the max iteration");
				break;
			}
			const i1 = this._getIllegalValue(examineAll);
			if (i1 == -1) {
				if (!examineAll) {
					examineAll = true;
					continue;
				}
				else 
					break;
			}
			let i2 = i1;
			while (i1==i2) 
				i2 = Math.floor(Math.random() * this.data.length);
			this._update(i2,i1);
		}
	}

}

module.exports = SVM;

