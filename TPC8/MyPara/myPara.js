var isEdit = false
var curEdit = undefined

$(function () {

    $.get('http://localhost:7709/paras', function (data) {
        data.forEach(p => {
            str =`
            <li>
                <div class="w3-row">
                    <div class="w3-col s10">${p.para}</div>
                    <div class="w3-col s1"><button id="edit-${p._id}" class="w3-button w3-padding-small w3-blue w3-round-large">Edit</button></div>
                    <div class="w3-col s1"><button id="delete-${p._id}" class="w3-button w3-padding-small w3-red w3-round-large">Remove</button></div>
                </div>
            </li>
            `
            $("#paraList").append(str);
        })
    });

    $("#addPara").click(function () {
        if(!isEdit){
            $.post("http://localhost:7709/paras", $("#paraText").serialize())
            alert('Record inserted: ' + JSON.stringify($("#paraText").serialize()))
            location.reload()
        }else{
            isEdit = false
            let value = $("#paraText").val()
            var data = {}
            data["para"] = value
            data["id"] = curEdit
            $.ajax({
                url: 'http://localhost:7709/paras',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function(){
                    location.reload()
                }
            })
        }
    });
})

$(document).on('click','button[id^=delete]',function(){
    var id = $(this).attr("id").split("-")[1]
        $.ajax({
            url: 'http://localhost:7709/paras',
            type: 'delete',
            data: {
                "id":id
            },
            success: function(){
                location.reload()
            }
        })
})

$(document).on('click','button[id^=edit]',function(){
    location.reload
    curEdit = $(this).attr("id").split("-")[1]
    $("#titulo").text("Edit Paragraph")
    $("#titulo").removeClass("w3-teal").addClass("w3-blue")
    $("#addPara").attr('value',"Edit")
    $("#addPara").removeClass("w3-teal").addClass("w3-blue")
    isEdit = true
})