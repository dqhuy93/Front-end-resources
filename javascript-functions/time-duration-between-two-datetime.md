```javascript
/**
* @description: Time duration between two datetime
* @params: {startTime} start time to get duration
* @params: {endTime} end time to get duration
* @returns: {string} message
*/
getStringBreakTime(startTime: string, endTime: string) {
    let diff: any;
    let days: any;
    let hours: any;
    let minutes: any;
    let formatTime =  'YYYY-MM-DD HH:mm';
    diff = moment.duration(moment(endTime, formatTime).diff(moment(startTime, formatTime)));

    days = parseInt(diff.asDays(), 10);

    hours = parseInt(diff.asHours()); // but it gives total hours in given miliseconds which is not expacted.
    hours = hours - days*24;

    minutes = parseInt(diff.asMinutes()); // but it gives total minutes in given miliseconds which is not expacted.
    minutes = minutes - (days*24*60 + hours*60); // minutes.

    // {84} days, {23} hours, {20} minutes.
    if(days === 0) {
        if(hours === 0){
            if(minutes === 0){
                return '';
            }
            return `Break of ${minutes} minutes.`;
        }
        return `Break of ${hours} hours, ${minutes} minutes.`;
    }
    return `Break of ${days} days, ${hours} hours, ${minutes} minutes.`;
}
```
