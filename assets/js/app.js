const cl = console.log;

const postForm = document.getElementById('postForm');
const title = document.getElementById('title');
const content = document.getElementById('content');
const userId = document.getElementById('userId');
const showPost = document.getElementById('showPost');

const formSubmit = document.getElementById('formSubmit');
const formUpdate = document.getElementById('formUpdate');
const formCancel = document.getElementById('formCancel');


const loader = document.getElementById('loader');
const showLoader =()=>{
    loader.classList.remove('d-none');
}
const hideLoader =()=>{
    loader.classList.add('d-none');
}

const scrollUp = document.getElementById('scrollUp');


const BASE_URL = "https://tuc-api-practice-default-rtdb.firebaseio.com/";
const POST_URL = `${BASE_URL}/posts.json`;

const snakBar = (msg, icon)=>{
    swal.fire({
        title: msg,
        icon: icon,
        timer: 2500
    })
}

const templating = (arr) =>{
    let result = ''
    arr.forEach(ele => {
        result += `
                    <div class="card mb-3" id="${ele.id}">
                    <div class="card-header">${ele.title}</div>
                    <div class="card-body">${ele.content}</div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-primary" onClick="onEdit(this)"><i class="fa-solid fa-user-pen"></i>Edit</button>
                        <button class="btn btn-danger" onClick="onRemove(this)"><i class="fa-solid fa-trash-can"></i>Remove</button>
                    </div>
                </div>
                    `
    });
    showPost.innerHTML =result;
}


const createCard = (obj,res)=>{
    let card = document.createElement('div');
    card.classList.add("card", "mb-3");
    card.id = res.name;
    // cl(card);
    card.innerHTML = `
                        <div class="card-header">${obj.title}</div>
                    <div class="card-body">${obj.content}</div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-primary" onClick="onEdit(this)"><i class="fa-solid fa-user-pen"></i>Edit</button>
                        <button class="btn btn-danger" onClick="onRemove(this)"><i class="fa-solid fa-trash-can"></i>Remove</button>
                    </div>
                        `
    showPost.append(card);
}


const makeApiCall = (method,url,data)=>{
    showLoader();
    return new Promise((resolve,reject)=>{
        let xhr = new XMLHttpRequest()
        xhr.open(method,url);
        xhr.send(data ? JSON.stringify(data) : null);
        xhr.onload = function(){
            if(xhr.status >= 200 && xhr.status <= 299){
                let data = JSON.parse(xhr.response)
                resolve(data);
                hideLoader();
            }else{
                reject(xhr.status);
                snakBar(xhr.status, 'error')
                hideLoader()
            }
        }
    })
}

const fetchData = ()=>{
    showLoader();
    makeApiCall("GET", POST_URL)
    .then(res =>{
        let data = Object.keys(res).map(e=>({...res[e],id:e}))
        // cl(data);
        templating(data);
    })
    .catch(err=>{
        snakBar(err, "error")
    })
}
fetchData();



const onFormSubmit = (eve)=>{
    eve.preventDefault();
    let postObj = {
        content : content.value,
        title : title.value,
        userId : userId.value
    }
    postForm.reset();
    makeApiCall("POST", POST_URL, postObj)
    .then(res=>{
        createCard(postObj, res);
        snakBar("post Added Successfully", "success");
    })
    .catch(err=>{
        snakBar(err,"error")
    })
}

postForm.addEventListener("submit", onFormSubmit);

const upDateSubmitBtn =(value)=>{
    if(value){
        formSubmit.classList.add('d-none');
        formUpdate.classList.remove('d-none');
    }else{
        formSubmit.classList.remove('d-none');
        formUpdate.classList.add('d-none');
    }
}


const onEdit = (eve)=>{
    showLoader();
    let EDIT_ID = eve.closest('.card').id;
    // cl(EDIT_ID);
    localStorage.setItem('edit_id', EDIT_ID)
    let EDIT_URL = `${BASE_URL}/posts/${EDIT_ID}.json`
    // cl(EDIT_URL);
    makeApiCall("GET", EDIT_URL)
    .then(res=>{
        title.value = res.title;
        content.value = res.content;
        userId.value = res.userId;
        scrollToTop();
        upDateSubmitBtn(true);
        hideLoader();
    })
    .catch(err=>{
        snakBar(err,"error");
        hideLoader();
    })
}



const onFormUpdate = () =>{
    let upDatedId = localStorage.getItem("edit_id");
    let UPDATED_URL = `${BASE_URL}/posts/${upDatedId}.json`
    let upDateObj = {
        content: content.value,
        title: title.value,
        userId: userId.value
    }
    postForm.reset();
    showLoader();
    makeApiCall("PATCH", UPDATED_URL, upDateObj)
    .then(res=>{
        let cardChild = document.getElementById(upDatedId).children
        // cl(cardChild);
        cardChild[0].innerHTML = upDateObj.title
        cardChild[1].innerHTML = upDateObj.content
        snakBar("Post Updated Successfully", 'success');
        upDateSubmitBtn()
    })
    .catch(err=>{
        snakBar(err,'error');
    })
}

formUpdate.addEventListener("click", onFormUpdate);

const onRemove = (eve) =>{
    let removeId = eve.closest('.card').id
    let REMOVE_URL = `${BASE_URL}/posts/${removeId}.json`
    showLoader()
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          return makeApiCall("DELETE", REMOVE_URL);
        }else{
            throw new Error("User Cncelled The ACtion")
        }
      })
      .then((res)=>{
        document.getElementById(removeId).remove()
        snakBar("Removed SuccessFully", "success")
      })
      .catch(err =>{
        snakBar(err,"error")
        hideLoader();
      })
}

window.addEventListener("scroll", ()=>{
    if(scrollY > 300){
        scrollUp.classList.remove('d-none');
    }else{
        scrollUp.classList.add('d-none');
    }
})

const scrollToTop =() =>{
    scrollTo({
        top : 0,
        behavior : 'smooth'
    })
}

scrollUp.addEventListener("click", scrollToTop);

const onFormCancel =() =>{
    postForm.reset()
    upDateSubmitBtn()
}

formCancel.addEventListener("click", onFormCancel);




