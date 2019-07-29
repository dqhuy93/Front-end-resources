var arr_1 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// 1. time số lẻ trong mảng
function tim_so_le(arr) {
  let result = arr.filter((value, index) => {
    return value % 2 !== 0;
  });
  console.log(result);
}
// tim_so_le(arr_1);

// 2. sắp xếp mảng tăng dần
var arr_2 = [8, 7, 4, 1, 2, 6, 5, 3, 9];

function sort_tang_dan(arr) {
  let result = arr.sort((a, b) => a - b);
  console.log(result);
}
// sort_tang_dan(arr_2);

// 3. tìm số trùng lặp trong mảng, lặp lại nhiều hơn 2 lần
var arr_3 = [1, 1, 2, 3, 4, 5, 2, 4, 2, 4, 3, 4, 5, 6, 6];

function tim_trung_lap(arr) {
  let result = [];
  for (let i = 0; i < arr_3.length; i++) {
    if (
      arr_3.indexOf(arr_3[i], i + 1) > -1 &&
      result.indexOf(arr_3[i]) === -1
    ) {
      result.push(arr_3[i]);
    }
  }
  console.log(result);
}
// tim_trung_lap(arr_3);

// 4. đếm số lần trùng lặp của từng số trong mảng
var arr_4 = [1, 2, 3, 4, 5, 3, 2, 2, 3, 1];

function dem_trung_lap(arr) {
  let result = [];
  let temp;
  for (let i = 0; i < arr_4.length; i++) {
    temp = arr_4.filter(item => item === arr_4[i]);

    // neu ko push vào mảng result thì có thể làm gắn hơn
    if (result.filter(item => item.value === arr_4[i]).length === 0) {
      result.push({
        value: arr_4[i],
        repeat: temp.length
      });
    }
  }
  console.log(result);
}
// dem_trung_lap(arr_4);

// 5. tìm số liên tiếp trong mảng (4,5,6,7)
// Cho mot day nguyen duong va mot so duong k. Kiem tra trong day co day con k so lien tiep khong

var arr_5 = [4, 7, 9, 3, 2, 6, 7, 0];
// so lien tiep 4 la

// 6. chèn phần tử vào mảng [1,2,3,4,5] => [1,2,3,4,5]
var arr_6 = [1, 2, 3, 5];
arr_6.splice(3, 0, 4);
// console.log(arr_6);

// 7. xáo trộn mảng
var arr_7 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
function xao_tron_mang(arr) {
  var result = arr.sort(() => {
    var temp = Math.random() - 0.5;
    return temp;
  });
  console.log(result);
}
// xao_tron_mang(arr_7);

// 8. chọn random trong mảng
var arr_8 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
function chon_random(arr) {
  console.log(arr[Math.floor(Math.random() * arr.length)]);
}
// chon_random(arr_8);

// 9. Cho trước 1 string, tìm một ký tự trong string đó mà xuất hiện nhiều hơn 2 lần
var string_9 = 'dai hoc nguyen tat thanh';
function tim_ky_tu_xuat_hien_hon_2lan(string_9) {
  // chuyển string thành array bằng .split();
  // lam theo bài số 3
}
// 10. Cho 1 mảng số nguyên, trong đó CHỨA 1 số nguyên lẻ loi (xhien đúng 1 lần) và các số nguyên còn lại thì xuất hiện >= 2 lần. Tìm số lẻ loi đó
var arr_10 = [1, 4, 2, 2, 3, 1, 3, 4, 5]; // so 5 xuat hien 1 lan
function foo_10(arr) {
  console.log('Độ dài mảng: ' + arr.length);
  let temp;
  let so_da_ton_tai = [];
  let result;
  for (let i = 0; i < arr.length; i++) {
    temp = arr.indexOf(arr[i], i + 1);
    if (temp === -1 && !so_da_ton_tai.includes(arr[i])) {
      result = arr[i];
    } else {
      so_da_ton_tai.push(arr[i]);
    }
  }
  console.log(result);
}
// foo_10(arr_10);

function cach_2_foo_10(arr) {
  console.log('Độ dài mảng: ' + arr.length);
  let temp;
  let result;
  for (let i = 0; i < arr.length; i++) {
    temp = arr.filter(item => item === arr[i]);
    if (temp.length === 1) {
      result = arr[i];
      break;
    }
  }
  console.log(result);
}
// cach_2_foo_10(arr_10);

// 11. Cho mảng số nguyên. Với mỗi phần tử trong mảng, trả về phần tử gần nhất nằm bên trái phần tử ấy đồng thời phải nhỏ hơn
var arr_11 = [1, 6, 5, 3, 2, 9, 4, 11, 12, 0];
function foo(arr) {
  console.log('Độ dài mảng: ' + arr.length);
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    let temp = {
      value: arr[i],
      so_nho_hon: null
    };
    // if (i === 0) {
    //   temp.so_nho_hon = 'khong co';
    //   result.push(temp);
    // } else {
    for (let k = i - 1; k >= 0; k--) {
      if (arr[k] < arr[i]) {
        temp.so_nho_hon = arr[k];
        break;
      }
    }
    result.push(temp);
    // }
  }
  console.log(result);
}
// foo(arr_11);
