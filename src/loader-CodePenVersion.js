/*!
 * Jste Loader For Jste Demos On CodePen
 * https://project-jste.github.io/
 *
 * Copyright 2018 Jste Team
 * Released under the GNU AGPLv3 license
 * https://project-jste.github.io/license
 *
 * Date: 2018-02-16
 */
import 'particles.js'
import style from './style.css'

function initLoader(image, isProgress) {
    style.use()
    document.getElementsByTagName("BODY")[0].innerHTML = `<div id="particles-js"><img id="loader_logo" src="${image}" /><progress /></div>`
    particlesJS("particles-js", {
        particles: {
            number: {
                value: 160,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#ffffff"
            },
            shape: {
                type: "circle",
                stroke: {
                    width: 0,
                    color: "#000000"
                },
                polygon: {
                    nb_sides: 5
                },
                image: {
                    src: "img/github.svg",
                    width: 100,
                    height: 100
                }
            },
            opacity: {
                value: 1,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: false,
                    speed: 4,
                    size_min: 0.3,
                    sync: false
                }
            },
            line_linked: {
                enable: false,
                distance: 150,
                color: "#ffffff",
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 600
                }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: false,
                    mode: "grab"
                },
                onclick: {
                    enable: true,
                    mode: "push"
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 400,
                    line_linked: {
                        opacity: 1
                    }
                },
                bubble: {
                    distance: 250,
                    size: 0,
                    duration: 2,
                    opacity: 0,
                    speed: 3
                },
                repulse: {
                    distance: 400,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                },
                remove: {
                    particles_nb: 2
                }
            }
        },
        retina_detect: true
    })
}

function finishLoading() {
    style.unuse()
    document.getElementById("particles-js").outerHTML = ""
}
window.onload = function () {
    window.isLive = true;
    var temp = location.host.split('.').reverse();
    var root_domain = temp[1] + '.' + temp[0];
    if (root_domain == 'codepen.io') {
        document.jsteCode = document.getElementsByTagName("BODY")[0].innerHTML;
        document.code = '<jste style="display: none;">\n' + document.jsteCode + '\n</jste>';
        document.getElementsByTagName("BODY")[0].innerHTML = '';
        let logoURL
        if (/^\s*\* its logo is (.*?)$/mi.test(document.jsteCode)) {
            logoURL = /^\s*\* its logo is (.*?)$/mi.exec(document.jsteCode)[1]
        } else if (/^\s*\* son logo est (.*?)$/mi.test(document.jsteCode)) {
            logoURL = /^\s*\* son logo est (.*?)$/mi.exec(document.jsteCode)[1]
        } else if (/^\s*\* الشعار الخاص به (.*?)$/mi.test(document.jsteCode)) {
            logoURL = /^\s*\* الشعار الخاص به (.*?)$/mi.exec(document.jsteCode)[1]
        } else if (/^\s*\* اللوجو بتاعه (.*?)$/mi.test(document.jsteCode)) {
            logoURL = /^\s*\* اللوجو بتاعه (.*?)$/mi.exec(document.jsteCode)[1]
        }
        initLoader(logoURL)
        fetch(`https://jste-manager.herokuapp.com/getBuildInfo`)
            .then(res => res.json())
            .then(function (genuineBuildInfo) {
                window.genuineFileSize = genuineBuildInfo.naturalScript.minified.size
                window.genuineFileHash = genuineBuildInfo.naturalScript.minified.sha1
                const progressBar = document.getElementsByTagName('PROGRESS')[0]
                progressBar.value = 0
                progressBar.max = window.genuineFileSize
                fetch('https://jste-manager.herokuapp.com/naturalScript.min.js')
                    .then(response => {
                        const contentLength = window.genuineFileSize
                        const total = parseInt(contentLength, 10)
                        let loaded = 0
                        return new Response(
                            new ReadableStream({
                                start(controller) {
                                    const reader = response.body.getReader()
                                    read()

                                    function read() {
                                        reader.read().then(({
                                            done,
                                            value
                                        }) => {
                                            if (done) {
                                                controller.close()
                                                return
                                            }
                                            loaded += value.byteLength
                                            progressBar.value = loaded
                                            controller.enqueue(value)
                                            read()
                                        }).catch(error => {
                                            console.error(error)
                                            controller.error(error)
                                        })
                                    }
                                }
                            })
                        )
                    })
                    .then(res => res.text())
                    .then(function (frameworkCode) {
                        document.getElementsByTagName("BODY")[0].innerHTML = document.code
                        setTimeout(function () {
                            eval(frameworkCode)
                            finishLoading()
                        }, 1000)
                    }).catch(function (err) {
                        finishLoading()
                        document.getElementsByTagName("BODY")[0].style.background = 'black'
                        document.getElementsByTagName("BODY")[0].innerHTML = `<center><h1 style='color: white;'>${err}</h1></center>`
                    })
            })
    }
}