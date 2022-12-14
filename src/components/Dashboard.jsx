import { createRef, useState } from "react";

export default function Dashboard(props) {
    const [keybinds, setKeybinds] = useState({ image: [], video: [] });
    const imageRef = createRef();
    const videoRef = createRef();
    const refs = {
        image: imageRef,
        video: videoRef,
    };

    const handleChange = (v) => props.IPC.send("updateStore", JSON.parse(`{"${v.target.name}": "${v.target.value}"}`));

    const handleKeydown = (e) => {
        const key = e.key.toUpperCase().replace(" ", "SPACE").replace("META", "COMMAND").replace("ALT", "OPTION");
        const id = e.target.id;
        if (keybinds[id].includes(key)) return;
        const _keybinds = { ...keybinds, [id]: [...keybinds[id], key] };
        setKeybinds(_keybinds);
        if (_keybinds[id].length >= 3) {
            refs[id].current.classList.remove("recording");
            props.IPC.send("updateStore", { keybinds: _keybinds });
            props.IPC.send("updateKeybinds", _keybinds);
            refs[id].current.blur();
        }
    };

    const parseKeys = (keys) => {
        return keys.map((key) => {
            return key
                .replace("SPACE", "␣")
                .replace("SHIFT", "⇧")
                .replace("CONTROL", "⌃")
                .replace("CAPSLOCK", "⇪")
                .replace("COMMAND", "⌘")
                .replace("OPTION", "⌥");
        });
    };

    return (
        <>
            <div className="text-center p-2">
                <div>
                    <div className="row">
                        <div className="absolute top-0 left-0 m-4 text-sm">
                            <span className="truncate">
                                <img
                                    className="rounded-full h-8 w-8 inline -mt-2"
                                    src={`https://us-east-1.tixte.net/assets/avatars/${props.store.user.id}/${props.store.user.avatar}.png`}
                                    alt=""
                                />
                                <span className="ml-2">{props.store.user.username}</span>
                            </span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="absolute top-0 right-0 m-4 text-sm cursor-pointer">
                            <span
                                className="text-red-500 hover:underline hover:cursor-pointer"
                                onClick={() => props.IPC.send("logout")}
                            >
                                Logout
                            </span>
                        </div>
                    </div>
                </div>
                <hr className="mt-10" />
                <div className="m-2 grid grid-cols-3 gap-2 text-left">
                    <div className="col-span-1">
                        <p className="text-sm text-gray-400 font-semibold mt-3 pb-1">Upload Domain</p>
                        <select
                            name="domain"
                            className="settings secondaryDropdown mt-1 w-full cursor-pointer"
                            value={props.store.domain}
                            onChange={(v) => handleChange(v)}
                        >
                            <option value={"random"}>Random Domain</option>
                            {props.store?.domains?.length &&
                                props.store?.domains?.map((domain) => {
                                    return (
                                        <option key={domain.name} value={domain.name}>
                                            {domain.name}
                                        </option>
                                    );
                                })}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <p className="text-sm text-gray-400 font-semibold mt-3 pb-1">Image Keybind</p>
                        <input
                            id="image"
                            ref={imageRef}
                            className="settings input mt-1 w-full"
                            readOnly={true}
                            value={
                                keybinds.image.length
                                    ? parseKeys(keybinds.image).join(" + ")
                                    : props.store?.keybinds?.image?.length
                                    ? parseKeys(props.store?.keybinds?.image).join(" + ")
                                    : "No keybind set"
                            }
                            onKeyDown={(e) => handleKeydown(e)}
                            onFocus={() => {
                                props.IPC.send("updateKeybinds");
                                setKeybinds({ image: [], video: [...props.store.keybinds.video] });
                                imageRef.current.classList.add("recording");
                            }}
                            onBlur={() => {
                                if (!imageRef.current.classList.contains("recording")) return;
                                imageRef.current.classList.remove("recording");
                                if (!keybinds.image.length) return;
                                props.IPC.send("updateStore", { keybinds: keybinds });
                                props.IPC.send("updateKeybinds", keybinds);
                            }}
                        />
                    </div>
                    <div className="col-span-1">
                        <p className="text-sm text-gray-400 font-semibold mt-3 pb-1">Video Keybind</p>
                        <input
                            id="video"
                            ref={videoRef}
                            className="settings input mt-1 w-full"
                            readOnly={true}
                            value={
                                keybinds.video.length
                                    ? parseKeys(keybinds.video).join(" + ")
                                    : props.store?.keybinds?.video?.length
                                    ? parseKeys(props.store?.keybinds?.video).join(" + ")
                                    : "No keybind set"
                            }
                            onKeyDown={(e) => handleKeydown(e)}
                            onFocus={() => {
                                props.IPC.send("updateKeybinds");
                                setKeybinds({ image: [...props.store.keybinds.image], video: [] });
                                videoRef.current.classList.add("recording");
                            }}
                            onBlur={() => {
                                if (!imageRef.current.classList.contains("recording")) return;
                                imageRef.current.classList.remove("recording");
                                if (!keybinds.image.length) return;
                                props.IPC.send("updateStore", { keybinds: keybinds });
                                props.IPC.send("updateKeybinds", keybinds);
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
