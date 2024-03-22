const SQLFormatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

const ucwords = value => {
    value = value.replace(/_/g,' ');
    let strArr = value.split(" ");
    let total = strArr.length;
    for (let i = 0; i < total; i++) {
        strArr[i] = strArr[i].charAt(0).toUpperCase() + strArr[i].slice(1);
    }
    console.log("strArr.toString()",strArr.toString().replace(/,/g,' '));
    return strArr.toString().replace(/,/g,' ');
}

const convertingCurrencyNumbers = (value) => {
    //value = 2000;
    let no = Math.floor(value);

    // let point = Math.round(value - no, 2) * 100;
    let hundred = null;
    let digits_1 = no.toString().length;
    let i = 0;
    let str = [];

    let words = { '0': '', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine', '10': 'Ten', '11': 'Eleven', '12': 'Twelve', '13': 'Thirteen', '14': 'Fourteen', '15': 'Fifteen', '16': 'Sixteen', '17': 'Seventeen', '18': 'Eighteen', '19': 'Nineteen', '20': 'Twenty', '30': 'Thirty', '40': 'Forty', '50': 'Fifty', '60': 'Sixty', '70': 'Seventy', '80': 'Eighty', '90': 'Ninety' };
    let digits = ['','Hundred', 'Thousand', 'Lakh', 'Crore'];
    let j=0;
    while (i < digits_1) {
        let divider = (i == 2) ? 10 : 100;
        value = Math.floor(no % divider);
        no = Math.floor(no / divider);
        i += (divider == 10) ? 1 : 2;
        if (value) {
            let counter = str.length;
            let plural = (counter && value > 9) ? 's' : '';
            hundred = (counter == 1 && str[0]) ? ' and ' : '';
            str[j] = (value < 21) ? (words[value] + " " + digits[counter] + plural + " " + hundred) : (words[Math.floor(value / 10) * 10] + " " + words[value % 10] + " " + digits[counter] + plural + " " + hundred);
        } else str[j] = '';

        j++;
    }
    // console.log("str", str);
    str = str.reverse();
    let result = str.toString();
    result = result.replace("  ", " ");
    result = result.replace(" ,", " ");
    // result = ucwords(result);    
    return  result+ " Only";
}

const dateDiffInDays = (dateOne,dateTwo)=>{
    let date1 = new Date(dateOne);
    let date2 = new Date(dateTwo);
      
    // To calculate the time difference of two dates
    let Difference_In_Time = date2.getTime() - date1.getTime();
      
    // To calculate the no. of days between two dates
    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    return Difference_In_Days;
}

const slugify = str =>{
  return str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

module.exports = { SQLFormatDate, convertingCurrencyNumbers,dateDiffInDays, ucwords,slugify };