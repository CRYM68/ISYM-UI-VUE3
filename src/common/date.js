export default !function(){
	// 格式化时间
	Date.prototype.formatTime = function(  format = 'YYYY/MM/DD HH:MM' ){
		let month = this.getMonth() + 1;
		month =  month < 10?  '0' + month : month;
		
		let date = this.getDate();
		date = date < 10? '0' + date : date;
		
		let hours = this.getHours();
		hours = hours < 10? '0' + hours : hours;
		
		let minutes = this.getMinutes();
		minutes = minutes < 10? '0' + minutes : minutes;
		
		switch(format){
			case 'YYYY/MM/DD HH:MM':
				return `${this.getFullYear()}/${ month }/${ date } ${ hours }:${ minutes }`; 
				break;
				
			case 'MM月DD日 HH:MM':
				return `${ month }月${ date }日 ${ hours }:${ minutes }`;
				break;
				
			case 'YYYY-MM-DD':
				return `${ this.getFullYear() }-${ month }-${ date }`;
				break;
				
			case 'date':
			case 'YYYY/MM/DD':
				return `${ this.getFullYear() }/${ month }/${ date }`;
				break;
				
			case 'MM月DD日':
				return `${ month }月${ date }日`;
				break;
			
			case 'YYYY年MM月':
				return `${ this.getFullYear() }年${ month }月`
				
			case 'time':
			case 'HH:MM':
				return `${ hours }:${ minutes }`;
		}
	},
	
	// 获取星期几文本
	Date.prototype.getDayText = function( text = '星期' ){
		switch ( this.getDay() ) {
			case 0: return text + '日'; break;
			case 1: return text + '一'; break;
			case 2: return text + '二'; break;
			case 3: return text + '三'; break;
			case 4: return text + '四'; break;
			case 5: return text + '五'; break;
			case 6: return text + '六'; break;
		}
	}
}()

// export default {}