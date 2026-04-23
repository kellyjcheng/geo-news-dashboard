Dim root
root = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))

Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd /d """ & root & "client"" && npm run electron:start", 0, False
