var id = ""
var editing = false
$(function(){
    $.get('http://localhost:4000/',function(data){
        data.forEach(p => {
            var edit = $(`<input class="w3-btn w3-round-large w3-teal w3-hover-grey" id="editbtn" type="button" value="Edit"/>`)
            $(edit).click(function() {
                id = p._id;
                editing = true;
                $("#formType").text("Edit Paragraph:");
                $("#botao1").val("Edit Paragraph");
                $("#campo").val(p.paragraph);
            })
            var editDiv = $(`<div class="w3-cell"></div>`).append(edit).append("<br/>")
            var del = $(`<input class="w3-btn w3-round-large w3-teal w3-hover-red" id="delbtn" type="button" value="Delete"/>`)
            $(del).click(function() {
                $.ajax({
                    url: 'http://localhost:4000/delete/' + p._id,
                    type: 'DELETE',
                    success: function(response) {
                        location.reload()
                    }
                });
            })
            var delDiv = $(`<div class="w3-cell"></div>`).append(del).append("<br/>")
            var elem = $(`<li class="w3-bar">
            <span class="w3-right">
                <div class="w3-cell-row">

                </div>
            </span>
            <div class="w3-bar-item">
                <span>${p.date} : ${p.paragraph}</span>
            </div>
        </li>`)
            elem.children('span').children('div').append(editDiv).append(delDiv)
            $("#pars").append(elem);
        })
    })

    $("#botao1").click(function(){
        if (!editing){
            $.post('http://localhost:4000/',$("#paraForm").serialize())
            location.reload()
        }
        else{
            var data = $("#paraForm").serialize()
            data._id = id
            $.ajax({
                url: 'http://localhost:4000/edit/'+id,
                type: 'PUT',
                data: data,
                success: function(response) {
                    editing = false;
                    $("#campo").val("Parágrafo");
                    location.reload();
                }
            });
        }
    })
})