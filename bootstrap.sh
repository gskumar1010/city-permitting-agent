#!/bin/bash
set -e

apply_firmly(){
  if [ ! -f "${1}/kustomization.yaml" ]; then
    print_error "Please provide a dir with \"kustomization.yaml\""
    return 1
  fi

  # kludge
  until oc kustomize "${1}" --enable-helm | oc apply -f- 2>/dev/null
  do
    echo -n "."
    sleep 5
  done
  echo ""
  # until_true oc apply -k "${1}" 2>/dev/null
}


echo "Creating the city-permitting-agent-ui namespace, which holds the custom UI"
oc new-project city-permitting-agent-ui

echo "Creating the llama-serve namespace, which holds Llama Stack"
oc new-project llama-serve

echo "At this point, please import the cluster secrets following the installation guide"
read -p "Once completed, Press ENTER to continue"

echo "Installing the City Permitting Agent runtime components"
apply_firmly kubernetes/kustomize/overlay/maas

echo "Done"