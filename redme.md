#### upload
![step](/doc/upload.png)
```
<upload action="http://localhost:8883/api/uploadImg"
    :multiple="false"
    :defaultName="'button'"
    :maxSize="4048"
    :format="['jpg']"
    :onFormatError="formatError"
    :onExceededSize="sizeError"
    :onError="onError"
>
</upload>
```