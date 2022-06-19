$(function(){
    $("#buttonAddFile").click(function(){
        $("#filesDiv").append('<label class="w3-text-teal"><b>Selecionar ficheiro</b></label><input class="w3-input w3-border w3-light-grey" type="file" name="myFile"/>')
    })
})