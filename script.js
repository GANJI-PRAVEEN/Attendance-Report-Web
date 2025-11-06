
console.log(window.document);
function classesNeededToReach75(classesAttended,TotalClasses,classesPerDay,targetDateString){
  //formula to find the numberOfDays to go to get 75%
  let totalClassesShouldAtttend = (0.75*(TotalClasses)-classesAttended)/0.25;
  return totalClassesShouldAtttend;

}

function applyDetails(classesAttended,TotalClasses,classesPerDay,attendancePercentage,targetDateString,xClasses){
    let classesAttendSpan  =document.getElementById("fetchClassesAttended");
    let totalClassesSpan   = document.getElementById("fetchTotalClasses");
    let classesNeededSpan = document.getElementById("fetchClassesNeeded");
    let numberOfDaysToGo = document.getElementById("fetchnumberOfDaysToGo");
    let targetDateSpan = document.getElementById("fetchTargetDate");
    let remainingWorkingDays = document.getElementById("fetchRemainingWorkingDays");
    if(xClasses!=""){
      if(document.getElementById("msgPara")){
        document.getElementById("msgPara").remove();
      }
      let div =  document.getElementsByClassName("report")[0];
      let currentAttendaceText = document.getElementById("currentAttendace");
      let newpara = document.createElement("h4");
      newpara.textContent=`Your atttendance report after ${xClasses} Classes `;
      newpara.id="msgPara";
      newpara.style.textAlign="center";
      newpara.style.fontWeight="bold";
      currentAttendaceTag.after(newpara);
      classesAttended+=xClasses;
      TotalClasses+=xClasses;
      attendancePercentage=((classesAttended/TotalClasses)*100);
      currentAttendaceTag.textContent = `attendance after ${Math.ceil(xClasses/classesPerDay).toFixed(0)} Days (${xClasses}): ${attendancePercentage.toFixed(2)}%`;
    }
    let workingDays = getWorkingDaysUntilToday(targetDateString);
    remainingWorkingDays.value=''+workingDays;
    targetDateSpan.value = targetDateString;
    classesAttendSpan.value=`${classesAttended}`;
    totalClassesSpan.value=`${TotalClasses}`;
    let classesMustBeAtttend = classesNeededToReach75(classesAttended,TotalClasses,classesPerDay,targetDateString);
    classesNeededSpan.value = ''+classesMustBeAtttend;
    // console.log(ceil(classesMustBeAtttend/classesPerDay));
    let numberOfDaysToGoValue = Math.ceil(classesMustBeAtttend/classesPerDay);
    if(numberOfDaysToGoValue>workingDays){
      document.getElementsByClassName("Input")[3].style.backgroundColor = "#CD5C5C";
    }
    else document.getElementsByClassName("Input")[3].style.backgroundColor = "#32CD32";
    numberOfDaysToGo.value = ''+numberOfDaysToGoValue;

}
function getWorkingDaysUntilToday(targetDateString){
    const today = new Date();
    const targetDate = new Date(targetDateString);
    let count=0;

    for(let d = new Date(today); d<=targetDate;d.setDate(d.getDate()+1)){
      const day = d.getDay();

      if(day==0){
        //sunday
        continue;
      }

      if(day==6){
        const date = d.getDate();
        if(date>=8 && date<=14){
          //second saturday of the month
          continue;
        }
      }
      count++;
    }
    return count;
}



function calculateAttendance() {
  let classesAttended = Number(document.getElementById("classesAttended").value);
  let TotalClasses = Number(document.getElementById("TotalClasses").value);
  let classesPerDay = Number(document.getElementById("classesPerDay").value);
  let attendancePercentage = (classesAttended / TotalClasses) * 100;
  let targetDateString = document.getElementById("targetDate").value;
  let xClasses = Number(document.getElementById("xClasses").value);




  // console.log(document.getElementById("classesAttended").value);
  let meterCircle = document.getElementsByClassName("meterCircle")[0];
  meterCircle.style.setProperty('--value',attendancePercentage);
  currentAttendaceTag.textContent = `Your current Attendance is ${attendancePercentage.toFixed(2)}%`;
  applyDetails(classesAttended,TotalClasses,classesPerDay,attendancePercentage,targetDateString,xClasses);

}

let btnSubmit = document.getElementsByClassName("submitBTN")[0];
btnSubmit.addEventListener('click', calculateAttendance);
console.log(document.getElementsByClassName("Input"));
let currentAttendaceTag = document.getElementById("currentAttendace");

